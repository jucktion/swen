<?php

$limit = 25; //Feed post limit (only applies to feeds, not subreddits)
$feedtime = 3600; //Time for feed to pass to be eligible for update
$subtime = 1717;

function getUrl($base)
{
    $agent = ['Twitterbot/1.0','facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'];
    $ch = curl_init($base);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    // curl_setopt($ch, CURLOPT_REFERER, $base);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, getUserAgent($agent));
    $str = curl_exec($ch);
    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
    }
    curl_close($ch);

    if (isset($error_msg)) {
        echo $error_msg;
    }
    $invalid_characters = '/[^\x9\xa\x20-\xD7FF\xE000-\xFFFD]/';
    $ret = preg_replace($invalid_characters, '', $str);
    return $ret;
}
$arr = array();

function getUserAgent(array $array) {
    $randomIndex = array_rand($array);
    return $array[$randomIndex];
}

#First level of reddit sub parsing, get the subs, run the related functions
function parseReddit($subs)
{
    global $subtime;
    foreach ($subs as $s) {
        $filename = 'temp/' . $s . '-parsed.json';
        if (file_exists($filename)) {
            #echo $domain, 'Last updated ', time() - filemtime($filename) ,' Update when older than: ', $refreshtime ,' ';
            if (time() - filemtime($filename) > $subtime) {
                try {
                    parseStore($s);
                } catch (Exception $e) {
                    echo "Error: ", $e->getMessage, '<br>';
                }
            } else {
                echo $s . ': already updated<br>';
            }
        } else {
            try {
                parseStore($s);
            } catch (Exception $e) {
                echo "Error: ", $e->getMessage, '<br>';
            }
        }
        sleep(1);
    }
}

#
# 2nd level of Reddit parsing
# Function to parse and store Reddit json file
#
function parseStore($subs)
{
    $top = 'https://old.reddit.com/r/' . $subs . '/top.json';
    try {
        $lv = getUrl($top);
    } catch (Exception $e) {
        echo 'Caught exception: ', $e->getMessage(), "<br>";
    }

    if (isset($lv)) {
        $data = json_decode($lv, true);
        $datad = $data['data']['children'];
        foreach ($datad as $k => $v) {
            $arr[$k]['title'] = $v['data']['title'];
            $arr[$k]['url'] = $v['data']['url'];
            $arr[$k]['rurl'] = $v['data']['permalink'];
            $arr[$k]['score'] = $v['data']['score'];
                        // $arr[$k]['user'] = $v['data']['name'];
            // $arr[$k]['image'] = $v['data']['thumbnail'];
            // echo '<a href="'.$d['data']['url'].'">'.$d['data']['title'].'</a> via:<a href="'.$d['data']['permalink'].'">'.$d['data']['name'].'</a></br>';
        }
        $jd = json_encode($arr);
        if (isset($arr)) {
            $filename = 'temp/' . $subs . '-parsed.json';
            try {
                file_put_contents($filename, $jd);
                echo $subs . ': complete! <br>';
            } catch (Exception $e) {
                echo $subs, ' caught exception: ', $e->getMessage(), "\n";
            }
        }
    }
}

#
# 2nd level of Feed parsing, 
# When $test is true, it will output the SimpleXMLElement object
# When $json is true, json encode/decode is used after SimpleXMLElement object. (slower in limited testing)
# Parses XML File for feeds
#
function parseXML($feed, $domain, $test = false, $json = false){
    global $limit;
    libxml_use_internal_errors(true);
    try {
        $xml = simplexml_load_string(getUrl($feed), 'SimpleXMLElement', LIBXML_NOCDATA);
    } catch (Exception $e) {
        echo $e->getMessage();
    }
    // Debug here when test is set to true
    if (!empty($xml) && $test) {
        //parse data for debug
            echo "<pre>";
            print_r($xml);
            echo "</pre>";
    }
    elseif(!empty($xml) && !$json){
        $k =0;
        if($domain == "nature"){
            foreach ($xml->item as $v) {
                $arr[$k]['title'] = (string)$v->title;
                $arr[$k]['url'] = (string)$v->link;
                $k++;
                if ($k == $limit) break;
            }
        }
        elseif($domain == "producthunt"){
            foreach ($xml->entry as $v) {
                $arr[$k]['title'] = (string)$v->title;
                $arr[$k]['url'] = (string)$v->link['href'];
                $k++;
                if ($k == $limit) break;
            }
        }
        else{ //Generic RSS parsing, limited to 25 entries
            foreach ($xml->channel->item  as $v) {
                $arr[$k]['title'] = (string)$v->title;
                $arr[$k]['url'] = (string)$v->link;
                

                //check comments link for ycombinator only
                $customdomains = ['ycombinator','lobsters'];
                if (in_array($domain,$customdomains)) {
                    if ($v->comments) {
                        $arr[$k]['com'] = (string)$v->comments;
                    }
                    $arr[$k]['score'] = ($domain == 'ycombinator' ? 'Y' : (($domain == 'lobsters') ? 'L' : (($domain == 'lemmytech') ? 'L' : '')));
                }
                $k++;
                if ($k == $limit) break;
            }
        }
        // var_dump($arr);
        if(isset($arr)){
        write_json($domain, $arr);
        }else{
            echo $domain . " array creation wasn't successful! <br>";
        }
    }
    elseif (!empty($xml) && $json) {
        $json = json_encode($xml->xpath('//channel/item'));
        $array = json_decode($json, true);

        foreach ($array as $k => $v) {
            $arr[$k]['title'] = $v['title'];
            $arr[$k]['url'] = $v['link'];

            //check comments link for yCombinator only
            if ($domain == 'ycombinator') {
                if (isset($v['comments'])) {
                    $arr[$k]['rurl'] = $v['comments'];
                    $arr[$k]['score'] = 'Y';
                }

            }
            //Image code
            // if (strpos($v['description'],'.jpg') >0){
            //     $re = '/https:\/\/.*.jpg/m';
            //     preg_match_all($re, $n->nodeValue, $matches, PREG_SET_ORDER, 0);
            //     $arr[$k]['image'] = $matches[0];
            // }
            // $v['description'];
            // //echo $item['title'];
        }
        //var_dump($arr);
        if(isset($arr)){
        write_json($domain, $arr);
        }else{
            echo $domain . " array creation wasn't successful!<br>";
        }
    } else {
        echo $domain . " returned empty <br>";
    }
}


#Write json file to temp folder
function write_json($domain, $array){
    global $feedtime;
    if(is_array($array)){
        $jd = json_encode($array);
        $filename = 'temp/' . $domain . '-parsed.json';
        if (file_exists($filename)) {
            if (time() - filemtime($filename) > $feedtime) {
                try {
                    file_put_contents($filename, $jd);
                    echo $domain . ': complete! <br>';
                } catch (Exception $e) {
                    echo $domain, ' caught exception: ', $e->getMessage(), "<br>";
                }
            }
            else {
                echo $domain, ': already updated<br>';
            }
        }else{
            try {
                file_put_contents($filename, $jd);
                echo $domain . ': complete! <br>';
            } catch (Exception $e) {
                echo $domain, ' caught exception: ', $e->getMessage(), "<br>";
            }
        }
    }else{
        echo "Array creation wasn't successful!";
    }
}

#
#Test uses print_r to output the result
function parseFeed($feed, $domain = false, $test = false){
    if ($domain === false) {
        #Special edge cases where domain names aren't extracted properly. as in links from RSSMix and locally made
        $domain = (strpos(parse_url($feed)['host'], 'nlk.fly.dev') !== false || strpos(parse_url($feed)['host'], 'rssmix.com') !== false) ? explode('/', parse_url($feed)['path'])[2] : preg_replace('/.*\./', '', preg_replace('/(\.com|\.net|\.org)/', '', parse_url($feed)['host']));
    }
    //echo $domain;
    $filename = 'temp/' . $domain . '-parsed.json';
    if (file_exists($filename)) {
        if (time() - filemtime($filename) > 3600 || $test) {
            try {
                if ($test) {
                    parseXML($feed, $domain, true);
                } else {parseXML($feed, $domain);}
            } catch (Exception $e) {
                echo $domain, " error: ", $e->getMessage, '<br>';
            }
        } else {
            echo $domain, ': already updated<br>';
        }
    } else {
        try {
            if ($test) {
                parseXML($feed, $domain, true);
            } else {parseXML($feed, $domain);}
        } catch (Exception $e) {
            echo $domain, " error: ", $e->getMessage, '<br>';
        }
    }
}
unset($arr);
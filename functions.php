<?php

function getUrl($base)
{
    $ch = curl_init($base);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    curl_setopt($ch, CURLOPT_REFERER, $base);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.106 Safari/537.36 Vivaldi/3.3.2022.45');
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

$refreshtime = 900; #time to check before updating cache

#First level of reddit sub parsing, get the subs, run the related functions
function parseReddit($subs)
{
    foreach ($subs as $s) {
        $filename = 'temp/' . $s . '-parsed.json';
        if (file_exists($filename)) {
            if (time() - filemtime($filename) > $refreshtime) {
                try {
                    parseStore($s);
                } catch (Exception $e) {
                    echo "Error: ", $e->getMessage, '\n';
                }
            } else {
                echo $domain, ' already updated';
            }
        } else {
            try {
                parseStore($s);
            } catch (Exception $e) {
                echo "Error: ", $e->getMessage, '\n';
            }
        }
    }
}

#Function to parse and store Reddit json file
function parseStore($subs)
{
    $top = 'https://reddit.com/r/' . $subs . '/top.json';
    try {
        $lv = getUrl($top);
    } catch (Exception $e) {
        echo 'Caught exception: ', $e->getMessage(), "<br>";
    }

// $filename = $subs .'.json';
    // file_put_contents($filename, $lv);

#$jsf = file_get_contents('pics.json');
    if (isset($lv)) {
        $data = json_decode($lv, true);
        $datad = $data['data']['children'];
        foreach ($datad as $k => $v) {
            #echo '<a href="'.$d['data']['url'].'">'.$d['data']['title'].'</a> via:<a href="'.$d['data']['permalink'].'">'.$d['data']['name'].'</a></br>';
            $arr[$k]['title'] = $v['data']['title'];
            $arr[$k]['url'] = $v['data']['url'];
            $arr[$k]['user'] = $v['data']['name'];
            $arr[$k]['rurl'] = 'https://reddit.com' . $v['data']['permalink'];
            $arr[$k]['image'] = $v['data']['thumbnail'];
            $arr[$k]['score'] = $v['data']['score'];
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

#Parse XML File for feeds
function parseXML($feed, $domain, $test = false)
{
    libxml_use_internal_errors(true);
    try {
        $xml = simplexml_load_string(getUrl($feed), 'SimpleXMLElement', LIBXML_NOCDATA);
    } catch (Exception $e) {
        echo $e->getMessage();
    }

    if (!empty($xml) && $test) {
        var_dump($xml);
    } elseif (!empty($xml)) {
        $json = json_encode($xml->xpath('//channel/item'));
        $array = json_decode($json, true);
        //var_dump($array);
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

            // if (strpos($v['description'],'.jpg') >0){
            //     $re = '/https:\/\/.*.jpg/m';
            //     preg_match_all($re, $n->nodeValue, $matches, PREG_SET_ORDER, 0);
            //     $arr[$k]['image'] = $matches[0];
            // }
            // $v['description'];
            // //echo $item['title'];
        }
        //var_dump($arr);
        $jd = json_encode($arr);
        $filename = 'temp/' . $domain . '-parsed.json';
        try {
            file_put_contents($filename, $jd);
            echo $domain . ': complete! <br>';
        } catch (Exception $e) {
            echo $domain, ' caught exception: ', $e->getMessage(), "<br>";
        }
    } else {
        echo $domain . " returned empty <br>";
    }
}

//
function cparseFeed($feed)
{
    $xml = simplexml_load_string(getUrl($feed), 'SimpleXMLElement', LIBXML_NOCDATA);

    $json = json_encode($xml->xpath('//channel/item'));
    $array = json_decode($json, true);
    var_dump($array);
}

#Test uses var_dump to output the result
function parseFeed($feed, $domain = false, $test = false)
{
    if ($domain === false) {
        #Special edge cases where domain names aren't extracted properly. as in links from RSSMix and locally made
        $domain = (strpos(parse_url($feed)['host'], 'nlk.fly.dev') !== false || strpos(parse_url($feed)['host'], 'rssmix.com') !== false) ? explode('/', parse_url($feed)['path'])[2] : preg_replace('/.*\./', '', preg_replace('/(\.com|\.net|\.org)/', '', parse_url($feed)['host']));
    }
    //echo $domain;
    $filename = 'temp/' . $domain . '-parsed.json';
    if (file_exists($filename)) {
        if (time() - filemtime($filename) > $refreshtime) {
            try {
                if ($test === true) {
                    parseXML($feed, $domain, true);
                } else {parseXML($feed, $domain);}
            } catch (Exception $e) {
                echo $domain, " error: ", $e->getMessage, '<br>';
            }
        } else {
            echo $domain, ' already updated';
        }
    } else {
        try {
            if ($test === true) {
                parseXML($feed, $domain, true);
            } else {parseXML($feed, $domain);}
        } catch (Exception $e) {
            echo $domain, " error: ", $e->getMessage, '<br>';
        }
    }
}

function QFX()
{
    $feed = 'https://api.qfxcinemas.com/api/public/NowShowing';
    $data1 = json_decode(getUrl($feed), true);
    $feed2 = 'https://api.qfxcinemas.com/api/public/ComingSoon';
    $data2 = json_decode(getUrl($feed2), true);
    $data = array_merge($data1['data'], $data2['data']);
    //$data = $data1['data'] + $data2['data'];
    //var_dump( $data);
    //echo $data;
    foreach ($data as $k => $v) {
        //echo $article->plaintext;
        //$date->sub(new DateInterval('PT4H3M2S'));
        $arr[$k]['title'] = (array_key_exists('eventTypeID', $v)) ? 'Coming Soon: ' . htmlspecialchars_decode($v['name'], ENT_QUOTES) : 'Showing: ' . htmlspecialchars_decode($v['name'], ENT_QUOTES);
        $arr[$k]['description'] = htmlspecialchars_decode($v['annotation'], ENT_QUOTES);
        $arr[$k]['url'] = (isset($v['eventID'])) ? 'https://www.qfxcinemas.com/show?eventId=' . $v['eventID'] : '';
        $arr[$k]['image'] = 'https://api.qfxcinemas.com/' . $v['bannerUrl'];
    }
    $jd = json_encode($arr);

    $filename = 'temp/qfx-parsed.json';
    try {
        file_put_contents($filename, $jd);
        echo 'QFX: complete! <br>';
    } catch (Exception $e) {
        echo 'QFX Caught exception: ', $e->getMessage(), "<br>";
    }

}

function parseQFX()
{
    $filename = 'temp/qfx-parsed.json';
    if (file_exists($filename)) {
        if (time() - filemtime($filename) > 48 * $refreshtime) {
            QFX();
        }
    } else {
        QFX();
    }
}
unset($arr);

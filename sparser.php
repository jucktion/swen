<?php
$key = !empty(strval(getenv('SWEN_KEY'))) ? strval(getenv('SWEN_KEY')) : '';
if (empty($key)){
include_once 'functions.php';
include_once 'simple_html_dom.php';

function get_string_between($string, $start, $end){
    $string = ' ' . $string;
    $ini = strpos($string, $start);
    if ($ini == 0) return '';
    $ini += strlen($start);
    $len = strpos($string, $end, $ini) - $ini;
    return substr($string, $ini, $len);
}
function kathmandupost(){
    $data = getUrl('https://kathmandupost.com/national');
    $arr = array();
    $parsed = get_string_between($data, '<main>', '</main>');

    #echo $parsed;
    $html = new simple_html_dom();

    $html->load($parsed);
    #var_dump($html);
    foreach ($html->find('#news-list article') as $k => $article) {
    // $title = $article->find('a h3',0)->plaintext;
    // $link = $article->find('a',0)->href;
    // echo $title,'<br>', $link,'<br><br>';

    $arr[$k]['t'] = $article->find('a h3',0)->plaintext;
    $arr[$k]['u'] = 'https://kathmandupost.com' . $article->find('a',0)->href;
    // echo $article->plaintext, '<br>';
    }
    write_json('kathmandupost', $arr);
}

//himalayantimes
function himalayantimes(){
    $data = getUrl('http://thehimalayantimes.com/nepal');
    $arr = array();

    #echo $data;
    $html = new simple_html_dom();

    $html->load($data);
    #var_dump($html);
    foreach ($html->find('.row h3[class^="alith_post_title"]') as $k => $article) {
        if ($k == 23){
            break;
        }
        // $title = $article->find('a h3',0)->plaintext;
        // $link = $article->find('a',0)->href;
        // echo $title,'<br>', $link,'<br><br>';

        $arr[$k]['t'] = $article->find('a',0)->title;
        $arr[$k]['u'] = $article->find('a',0)->href;
        // echo $article->plaintext, '<br>';
    }
    write_json('himalayantimes', $arr);
}

//BBC
function bbcnp(){
    $data = getUrl('https://www.bbc.com/nepali');
    $arr = array();

    #echo $parsed;
    $html = new simple_html_dom();

    $html->load($data);
    #var_dump($html);
    #foreach ($html->find('h3[class*="-Headline"]') as $k => $article) {
    foreach ($html->find('main h3 a[href*="/nepali/articles"]') as $k => $article) {
        // $title = $article->find('a',0)->plaintext;
        // $link = $article->find('a',0)->href;
        // echo $title,'<br>', $link,'<br><br>';

        $arr[$k]['t'] = $article->plaintext;
        $arr[$k]['u'] = $article->href;
        // echo $article->plaintext, '<br>';
    }

    write_json('bbcnp', $arr);
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
        $arr[$k]['t'] = (array_key_exists('eventTypeID', $v)) ? 'Coming Soon: ' . htmlspecialchars_decode($v['name'], ENT_QUOTES) : 'Showing: ' . htmlspecialchars_decode($v['name'], ENT_QUOTES);
        $arr[$k]['d'] = htmlspecialchars_decode($v['annotation'], ENT_QUOTES);
        $arr[$k]['u'] = (isset($v['eventID'])) ? 'https://www.qfxcinemas.com/show?eventId=' . $v['eventID'] : '#';
        $arr[$k]['i'] = 'https://api.qfxcinemas.com/' . $v['bannerUrl'];
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
        if (time() - filemtime($filename) > 48 * 3600) {
            QFX();
        }
    } else {
        QFX();
    }
}

function sharesansarIPO(){
        $data = getUrl('https://www.sharesansar.com/category/ipo-fpo-news');
        $arr = array();
    
        //echo $parsed;
        $html = new simple_html_dom();
    
        $html->load($data);
        #var_dump($html);
        #foreach ($html->find('h3[class*="-Headline"]') as $k => $article) {
        foreach ($html->find('.newslist div.col-xs-12 a') as $k => $article) {
            // $title = $article->find('a',0)->plaintext;
            // $link = $article->find('a',0)->href;
            // echo $title,'<br>', $link,'<br><br>';
    
            $arr[$k]['t'] = $article->find('h4',0)->plaintext;
            $arr[$k]['u'] = $article->href;
            // echo $article->plaintext, '<br>';
        }
        write_json('npipo', $arr);
    }

kathmandupost();
bbcnp();
sharesansarIPO();
himalayantimes();
// parseQFX();
}
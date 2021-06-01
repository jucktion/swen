<?php
if (isset($_GET['k']) && $_GET['k'] == 'JuckTion321123'){
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

    $arr[$k]['title'] = $article->find('a h3',0)->plaintext;
    $arr[$k]['url'] = 'https://kathmandupost.com' . $article->find('a',0)->href;
    // echo $article->plaintext, '<br>';
    }
    $domain = 'kathmandupost';
    write_json($domain, $arr);
}

//himalayantimes
function himalayantimes(){
    $data = getUrl('https://thehimalayantimes.com/nepal');
    $arr = array();

    #echo $parsed;
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

        $arr[$k]['title'] = $article->find('a',0)->title;
        $arr[$k]['url'] = $article->find('a',0)->href;
        // echo $article->plaintext, '<br>';
    }
    $domain = 'himalayantimes';
    write_json($domain, $arr);
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
    foreach ($html->find('main h3 a[href*="/nepali/news-"]') as $k => $article) {
        // $title = $article->find('a',0)->plaintext;
        // $link = $article->find('a',0)->href;
        // echo $title,'<br>', $link,'<br><br>';

        $arr[$k]['title'] = $article->plaintext;
        $arr[$k]['url'] = 'https://bbc.com'. $article->href;
        // echo $article->plaintext, '<br>';
    }
    $domain = 'bbcnp';
    write_json($domain, $arr);
}

kathmandupost();
himalayantimes();
bbcnp();
parseQFX();
}
// $htmlNodes = $doc->getElementsByTagName('article');
// foreach ($htmlNodes as $item){
//     echo $item;
// }

#cparsefeed('https://news.ycombinator.com/rss');
#parseStore('technology');

#Test Feed links

#parseFeed('http://feeds.nature.com/nature/rss/current?format=xml', 'nature', $test = true);

// $xml = simplexml_load_string(getUrl('https://techcrunch.com/feed/'), 'SimpleXMLElement', LIBXML_NOCDATA);
// var_dump($xml);

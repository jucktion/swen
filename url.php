<?php
#print_r($_GET);
if (isset($_GET['url'])){
    #echo 'URL is set';
    $url = filter_var($_GET['url'], FILTER_SANITIZE_URL);
    #echo $url;
    include_once('functions.php');
    $data = getUrl($url);
    if($data){
        echo $data;
    }
    else{
        echo "Couldn\'t get anything";
    }
}
else{
    echo 'Nothing is set...';
}
?>
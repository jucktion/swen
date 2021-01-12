<?php
if ($_GET['url'] && filter_var($_GET['url'], FILTER_VALIDATE_URL)){
    include_once('functions.php');
    $data = getUrl($_GET['url']);
    echo $data;
}
else{
    echo '';
}
?>
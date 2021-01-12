<?php
include_once('functions.php');
if ($_GET['url'] && filter_var($_GET['url'], FILTER_VALIDATE_URL)){
    $data = getUrl($_GET['url']);
    echo $data;
}
else{
    echo '';
}
?>
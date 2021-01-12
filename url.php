<?php
if ($_POST['url'] && filter_var($_POST['url'], FILTER_VALIDATE_URL)){
    include_once('functions.php');
    $data = getUrl($_POST['url']);
    if($data){
        echo $data;
    }
    else{
        echo "Couldn\'t get anything";
    }
}
else{
    echo 'Nothing here...';
}
?>
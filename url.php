<?php
#print_r($_GET);
if (isset($_GET['url']) && filter_var($_GET['url'], FILTER_VALIDATE_URL)){
    include_once('functions.php');
    $data = getUrl($_GET['url']);
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
<?php
#print_r($_GET);
if (isset($_GET['url'])){
    echo 'URL is set';
    if (filter_var($_GET['url'], FILTER_VALIDATE_URL)){
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
        echo 'Could not validate URL';
    }
}
else{
    echo 'Nothing is set...';
}
?>
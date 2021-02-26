<?php
ini_set("max_execution_time", "600");
if (isset($_GET['k']) && $_GET['k'] == 'banepa'){
include_once 'functions.php';
if (isset($_GET['s'])) {
    $subs = $_GET['s'];
    parseStore($subs);
}
#Test individual feeds if the feeds aren't working when bulk processed
elseif (isset($_GET['f']) && isset($_GET['n'])) {
    if (filter_var($_GET['f'], FILTER_VALIDATE_URL)) {
        parseFeed($_GET['f'], filter_var($_GET['n'], FILTER_SANITIZE_STRING));
    } else {
        echo 'Not a valid URL';
    }
} else {
    #parse Reddit subs
    $subs = ['technology', 'science', 'worldnews', 'todayilearned', 'programming', 'nepal', 'android', 'damnthatsinteresting', 'publicfreakout', 'lifeprotips', 'interestingasfuck', 'nextfuckinglevel'];
    parseReddit($subs);

    #parse RSS Feeds
    parseFeed('https://hnrss.org/frontpage', 'ycombinator');
    parseFeed('http://feeds.feedburner.com/TechCrunch?format=xml', 'techcrunch');
    parseFeed('https://rss.app/feeds/37WXdDGVoDuI4hbA.xml', 'bbcnp');
    parseFeed('http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'bbcsci');
    parseFeed('http://feeds.bbci.co.uk/news/technology/rss.xml', 'bbctech');
    parseFeed('https://rssmix.com/u/12292990/rss.xml', 'nature');
    parseFeed('http://feeds.feedburner.com/scienctistnew?format=xml','newscientist');
    parsefeed('https://feeds.bbci.co.uk/news/world/rss.xml');
    parsefeed('https://www.npr.org/rss/rss.php?id=1001');
    parsefeed('https://www.theguardian.com/world/rss');
    parsefeed('https://www.onlinekhabar.com/feed');
    parsefeed('https://www.setopati.com/feed');
    parsefeed('http://rssmix.com/u/9959139/rss.xml');
    parsefeed('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
}
}
#parseQFX();

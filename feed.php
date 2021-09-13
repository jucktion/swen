<?php
if (isset($_GET['k']) && $_GET['k'] == 'JuckTion321123'){
ini_set("max_execution_time", "600");
$stime = microtime(true);
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
    #
    # Parse Reddit subs
    # Array with the list of subs to fetch
    #
    $subs = ['technology', 'science', 'worldnews', 'todayilearned', 'programming', 'nepal', 'android', 'damnthatsinteresting', 'publicfreakout', 'lifeprotips', 'interestingasfuck', 'nextfuckinglevel'];
    parseReddit($subs);

    #
    # Parse RSS Feeds
    # One per line 
    #
    parseFeed('https://hnrss.org/frontpage', 'ycombinator');
    parseFeed('http://feeds.feedburner.com/TechCrunch?format=xml', 'techcrunch');
    parseFeed('http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'bbcsci');
    parseFeed('http://feeds.bbci.co.uk/news/technology/rss.xml', 'bbctech');
    parseFeed('http://feeds.nature.com/nature/rss/current?format=xml', 'nature');
    parseFeed('http://feeds.feedburner.com/scienctistnew?format=xml','newscientist');
    parsefeed('https://feeds.bbci.co.uk/news/world/rss.xml');
    parsefeed('https://www.npr.org/rss/rss.php?id=1001');
    parsefeed('https://www.theguardian.com/world/rss');
    parsefeed('https://www.onlinekhabar.com/feed');
    parsefeed('https://www.setopati.com/feed');
    parsefeed('https://www.producthunt.com/feed','producthunt');
    parsefeed('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
    parsefeed('https://dev.to/feed/','devto');
    parsefeed('https://www.freecodecamp.org/news/rss/','fcc');
    parsefeed('https://www.goodnewsnetwork.org/feed/','positive');
}
$etime = microtime(true);
$exc_time = ($etime - $stime);
echo "<p>Script ran in ".$exc_time." sec</p>";
}
die();
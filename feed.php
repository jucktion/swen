<?php
$key = !empty(strval(getenv('SWEN_KEY'))) ? strval(getenv('SWEN_KEY')) : '';
if (isset($_GET['k']) && $_GET['k'] == $key){
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
    $subs = ['technology', 'science', 'worldnews', 'todayilearned', 'programming', 'nepal', 'android', 'damnthatsinteresting', 'publicfreakout', 'lifeprotips', 'interestingasfuck', 'nextfuckinglevel', 'privacy'];
    parseReddit($subs);

    #
    # Parse RSS Feeds
    # One per line 
    #
    parseFeed('https://hnrss.org/frontpage', 'ycombinator');
    parseFeed('https://techcrunch.com/feed/', 'techcrunch');
    parseFeed('https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'bbcsci');
    parseFeed('https://feeds.bbci.co.uk/news/technology/rss.xml', 'bbctech');
    parseFeed('http://feeds.nature.com/nature/rss/current?format=xml', 'nature');
    parseFeed('https://www.newscientist.com/feed/home/','newscientist');
    parseFeed('https://feeds.bbci.co.uk/news/world/rss.xml');
    parsefeed('https://www.npr.org/rss/rss.php?id=1001');
    parseFeed('https://www.theguardian.com/world/rss');
    parseFeed('https://www.onlinekhabar.com/feed');
    parseFeed('https://www.setopati.com/feed');
    ParseFeed('https://wkn.herokuapp.com/f/ntc/i.xml','ntc');
    parseFeed('https://www.producthunt.com/feed','producthunt');
    parseFeed('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
    parseFeed('https://dev.to/feed/','devto');
    parseFeed('https://www.freecodecamp.org/news/rss/','fcc');
    parseFeed('https://www.goodnewsnetwork.org/feed/','positive');
    parseFeed('https://medicalxpress.com/rss-feed/','medx');
    parseFeed('https://techxplore.com/rss-feed/','techx');
    parseFeed('https://css-tricks.com/feed/','csstricks');
    parseFeed('https://lobste.rs/top/rss','lobsters');
    parseFeed('https://lemmy.ml/feeds/c/technology.xml?sort=Hot','lemmytech');

}
$etime = microtime(true);
$exc_time = ($etime - $stime);
echo "<p>Script completed in ".$exc_time." sec</p>";
}
die();

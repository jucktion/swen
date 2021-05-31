# SWEN - Categorized news with RSS/Reddit

## Getting Started

### Backend
The script fetches the destinations using curl, processes the content, and saves them in `json` files in the `temp` directory.

The `feed.php` file is the processing hub of this project. It contains the sub reddits and feeds that are to be fetched and processed. A `cron job` is set to run in an interval to retrive the data and process it into `json` files in the `temp` folder. 

#### Subreddits
The `$subs` variable is an array that contains the name of the subreddits to be pinged. 

For subreddits, the name of the subreddit is used in the parsed json file.

E.g. for `worldnews` subreddit, the file would be saved as `worldnews-parsed.json`.

#### RSS Feeds
For parsed feeds, there is some rudimentary processing to use the domain name for the parsed file name. However, if yo want a specific name, `parsefeed(feed_link, name)` function is used. Which takes two arguments, the feed link and the name prepended to the parsed json file.

E.g. for

```
parseFeed('http://feeds.bbci.co.uk/news/technology/rss.xml', 'bbctech');
```

the parsed file will be saved as `bbctech-parsed.json`

#### Security

An simple url query string parameter `k` is used to prevent unauthorized requests for processing.

If you use `run123` value for `k`, a valid link to process the feeds will be:

```
https://domain.com/feed.php?k=run123
```

### Frontend

On the `index.html`, second level tabs are represented in `<tab name="npr" title="NPR"></tab>` format. The `name` attribute of the tab represents the `json` file to call.

For tab with the name `npr`, it will call the `npr-parsed.json` file and process it when that tab is clicked.

The `title` is what's displayed on the tab display.

### Cron Job

You can run cron jobs on your own linux system with `crontab -e` or use external services.
```
php <script-location>/feed.php?k=run123 > dev/null 2>&1
```

### Credits
Laracasts [youtube video](https://youtu.be/-95jgDDZq3Y) on VueJS and Tabs

[VueJS Project](https://vuejs.org/)

[PHP Developers](https://www.php.net/)
# SWEN - Categorized news with RSS/Reddit

Collect news in a single place for Reddit subs and RSS feeds. The Text-to-Speech (TTS) helps you listen to your news. The TTS management settings help you configure the TTS sounds available on your device. Additionally, you can set pitch, speed and interval configuration.

![Screenshot]('screenshot.png?raw=true')

## Getting Started

The script fetches the destinations using php-curl, processes the content, and saves them in `json` files in the `temp` directory. On the frontend, VueJS preares the virtual DOM and uses the json files to list the items listed in the json file. The TTS uses the voices available on your device. If your device has a natural voice engine, it is a much more pleasant experience.

### Backend

The `feed.php` file is the processing hub of this project. It contains the sub reddits and feeds that are to be fetched and processed. A `cron job` is set to run in an interval to retrive the data and process it into `json` files in the `\temp` folder.

The core functions are present in `functions.php`. For setting up, you do not need to edit the `functions.php` file. By default, the `top` list of the subreddit is requested. 

#### Subreddits:
The `$subs` variable is an array that contains the name of the subreddits to be requested. 

For subreddits, the name of the subreddit is used in the parsed json file.

E.g. For `worldnews` subreddit, the file would be saved as `worldnews-parsed.json`.

#### RSS Feeds:
For parsing feeds, there is some rudimentary name extraction process to use the domain name for the parsed file name. It might not work with sub-domains and complicated URLs. It is easier if you a specific name is provided using the `parsefeed(feed_link, name)` syntax. Which takes two arguments, the RSS feed link and the name prepended to the parsed json file.

E.g.

```
parseFeed('http://feeds.bbci.co.uk/news/technology/rss.xml', 'bbctech');
```

For the above code, it will fetch the RSS URL and the parsed file will be saved as `bbctech-parsed.json` in the temp folder

Note: The sparser.php is a simple html parser to parse HTML into json made for sites that do not provide RSS feeds.

### Security

An simple URL query string parameter `k` is used to prevent unauthorized requests for processing the feeds

To use it in production, it is important that you have `SWEN_KEY` environment variable set. For local testing, if the environement variable is not set or is empty, the update will run with with just `/feed.php?k`. If more secure method can be used, please raise an issue.

With `SWEN_KEY` set to `run123`

```
https://domain.com/feed.php?k=run123
```
Without any environment variable set

```
https://domain.com/feed.php?k
```

### Frontend

On the `index.html`, first level of tabs are represented in `<chitab title=News :selected=true>`. The title is what get displayed in the frontend. Second level tabs are represented in `<tab name="npr" title="NPR"></tab>` format. The `name` attribute of the tab represents the `json` file to call.

For tab with the name `npr`, it will call the `npr-parsed.json` file and process it when that tab is clicked.

The `title` is what's displayed on the tab display.

### Cron Job

You can run cron jobs on your own linux system with `crontab -e` or use external services.
```
php <script-location>/feed.php?k=run123 > dev/null 2>&1
```

### Issues

#### Backend

- Setting a global timer on from line 31 to line 41 and 193

#### Frontend

Common Issues (PC/Mobile)

- Cannot select default TTS voice on first load on some devices

Common Mobile Issues

- When a tab has a lot of text, the TTS fails to initiate and speak. (solution: reduce the number of items to be read from the gear icon, like 1 to 15)

- Text to Speech FAB doesn't disappear on scroll to bottom

- Older devices, if capable of web speech synthesis, take time to pause and stop

Firefox Mobile (Android)

- Cannot pause (related to speechsynthesis API not being completely supported)


### Credits

[PHP Developers](https://www.php.net/)

[VueJS Project](https://vuejs.org/)

[Mozilla SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis)

[Bulma CSS](https://bulma.io/)

[Laracasts youtube video](https://youtu.be/-95jgDDZq3Y) on VueJS and Tabs
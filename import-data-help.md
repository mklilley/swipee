# How do I import links into Swipee?

Swipee allows you to add many links at once using the `Import data from file` feature inside of `Settings > Your data`.

Swipee understands two data formats, [JSON](https://www.w3schools.com/whatis/whatis_json.asp) and [CSV](https://www.computerhope.com/jargon/c/csv.htm).

## [JSON](https://www.w3schools.com/whatis/whatis_json.asp)

This data format is most useful when importing data that you've previously downloaded from Swipee using `Settings > Your data > Download your data`.

To import many links from a JSON formatted file, you must create an array (denoted by [...]) of JSON objects (denoted by {...}).

Each JSON object must contain at least 3 keys, `action`, `time` and `url` like the example below:

```
 [
  {
    "action": "read",
    "time": "short",
    "url": "https://eg.com/article"
  },
    {
    "action": "watch",
    "time": "long",
    "url": "https://eg.com/video"
  }
]
```

Additional keys can also be supplied: `title`, `domain`, `description`,`image`, `deck`, `skipped`. For example:

```
 [
  {
    "action": "read",
    "time": "short",
    "url": "https://eg.com/article",
    "image": "https://eg.com/article/img.jpg",
    "title": "Article title",
    "description": "This is an article",
    "domain": "eg.com",
    "skipped": false,
    "deck": "default"

  },
    {
    "action": "watch",
    "time": "long",
    "url": "https://eg.com/video",
    "image": "https://eg.com/video/img.jpg",
    "title": "Video title",
    "description": "This is a video",
    "domain": "eg.com",
    "skipped": false,
    "deck": "default"
  }
]
```

This more comprehensive example is the kind of data that you get when you select to download your data from the settings menu.

## [CSV](https://www.computerhope.com/jargon/c/csv.htm)

This data format is most convenient for importing links from outside of Swipee. The easiest way to import from CSV is to:

- Create spreadsheet
- Add data
- Export sheet to CSV format
- Import to Swipee

You must have at least 3 columns in your spreadsheet with names `url`, `action`, `time`. After exporting to CSV, it should look something like this:

```
url,action,time
https://eg.com/article,read,short
https://eg.com/video,watch,long
```

Additional columns can also be supplied: `title`, `domain`, `description`,`image`, `deck`, `skipped`. For example:

```
url,action,time,title,domain,description,image,deck,skipped
https://eg.com/article,read,short,Article title,eg.com,This is an article,https://eg.com/article/img.jpg,default,false
https://eg.com/video,watch,long,Video title,eg.com,This is a video,https://eg.com/video/img.jpg,default,false
```

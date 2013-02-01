var fs = require('fs');
var config = require('../config/config');
var db = require('../lib/db');

// read JSON data from file - abort on error
function read_json(filename) {
  var text = fs.readFileSync(filename, 'utf8');
  if(text) {
    return(JSON.parse(text));
  } else {
    console.log("Error reading " + filename);
    process.exit(1);
  }
};

// toISOString includes milliseconds - we don't want that here
function iso_format(date) {
  function pad(n) { return n < 10 ? '0' + n : n; }
  return date.getUTCFullYear() + '-'
    + pad(date.getUTCMonth() + 1) + '-'
    + pad(date.getUTCDate()) + 'T'
    + pad(date.getUTCHours()) + ':'
    + pad(date.getUTCMinutes()) + ':'
    + pad(date.getUTCSeconds()) + 'Z';
    };

// create date from string
function date_from_string(date) {
  var parsed_date = Date.parse(date);
  return(new Date(parsed_date));
}

// return schedule for channel and date range
function get_schedule(channel_id, start_date, end_date) {
  if(channel_id && start_date && end_date) {
    start_date = date_from_string(start_date);
    end_date = date_from_string(end_date);

    // check dates within range
    if(start_date > end_date
       || start_date < config.MIN_DATE
       || start_date > config.MAX_DATE
       || end_date < config.MIN_DATE
       || end_date > config.MAX_DATE) {
      return(false);
    }

    var next_date = new Date(start_date);
    var result = { };

    // for each date in range, add to result
    while(next_date <= end_date) {
      var key_date = iso_format(next_date);
      if(channel_id in db.schedule && key_date in db.schedule[channel_id]) {
        result[key_date] = db.schedule[channel_id][key_date];
      }
      next_date.setDate(next_date.getDate() + 1);
    }
    return(result);
  } else {
    return(false);
  }
}

// return bookmarks for user_id
function get_bookmarks(user_id) {
  if(user_id in db.bookmarks) {
    return(db.bookmarks[user_id]);
  } else {
    return(false);
  }
}

// return an individual bookmark
function get_bookmark(user_id, pid) {
  if(user_id in db.bookmarks && pid in db.bookmarks[user_id]) {
    return(db.bookmarks[user_id][pid]);
  } else {
    return(false);
  }
}

// create a bookmark
function put_bookmark(user_id, pid) {
  // TODO: check this is a valid user_id
  if(!(user_id in db.bookmarks)) {
    // create user
    db.bookmarks[user_id] = {};
  }
  // check this is a valid pid
  if(get_broadcast(pid)) {
      if(!(pid in db.bookmarks[user_id])) {
          // new bookmark - save date
          db.bookmarks[user_id][pid] = { user_id: user_id, pid: pid, create_date: iso_format(new Date()) };
      }
      return(db.bookmarks[user_id][pid]);
  } else {
      return(false);
  }
}

// delete a bookmark
function delete_bookmark(user_id, pid) {
  var rv = false;

  if(user_id in db.bookmarks && pid in db.bookmarks[user_id]) {
    bookmark = db.bookmarks[user_id][pid];
    delete db.bookmarks[user_id][pid];
    rv = bookmark;
  }
  return(rv);
}

// dump bookmarks (for debugging)
function dump_bookmarks() {
  console.log({ bookmarks: db.bookmarks });
  return(db.bookmarks);
}

// return broadcast given string id
function get_broadcast(pid) {
  var broadcasts;

  // console.log({schedule: db.schedule});
  for(channel in db.schedule) {
      channel = db.schedule[channel]
      // console.log({channel: channel});
      for(date in channel) {
          // console.log({date: date});
          broadcasts = channel[date];
          // console.log({broadcasts: broadcasts});
          for(i = 0; i < broadcasts.length; i++) {
              // console.log({bid: broadcasts[i].pid, pid: pid });
              if(broadcasts[i].pid == pid) {
                  return(broadcasts[i]);
              }
          }
      }
  }
  return(false);
}

// delete broadcast given string pid
function delete_broadcast(pid) {
  var broadcasts;

  console.log({schedule: db.schedule});
  for(channel in db.schedule) {
      channel = db.schedule[channel]
      console.log({channel: channel});
      for(date in channel) {
          console.log({date: date});
          broadcasts = channel[date];
          console.log({broadcasts: broadcasts});
          // reverse order to handle deletion
          for(i = broadcasts.length - 1; i >= 0; i--) {
              console.log({bid: broadcasts[i].pid, pid: pid });
              if(broadcasts[i].pid == pid) {
                  bc = broadcasts[i];
                  broadcasts.splice(i, 1);
                  return(bc);
              }
          }
      }
  }
  return(false);
}

// utility methods
module.exports.read_json       = read_json;

// API methods
module.exports.get_schedule    = get_schedule;
module.exports.get_bookmarks   = get_bookmarks;
module.exports.get_bookmark    = get_bookmark;
module.exports.put_bookmark    = put_bookmark;
module.exports.delete_bookmark = delete_bookmark;
module.exports.get_broadcast   = get_broadcast;

// DEBUG only
module.exports.dump_bookmarks  = dump_bookmarks;

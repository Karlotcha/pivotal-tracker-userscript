// ==UserScript==
// @name         PT - timers for stories to test and to finish
// @version      0.1
// @description  help PMs and devs to manage their stories
// @match        https://www.pivotaltracker.com/s/projects/*
// @author       Karlotcha Hoa
// ==/UserScript==

// **************************************************************************
// Story class
// **************************************************************************
function Story(id, $this){
  this.id   = id
  var that       = this
    , project_id = location.pathname.match(/\d{4,}/g)[0]
    , pt_api_url = 'https://www.pivotaltracker.com/services/v5/projects/' +
                    project_id +
                    '/stories/' +
                    id +
                    '/history?envelope=true'

  $.get(pt_api_url, function(d){
    that.data = d.data

    if ($this.hasClass('delivered')) {
      for (var i = 0, l=d.data.length; i<l ;i++) {
        if (d.data[i].action.highlight == "delivered") {
          that.updated_at   = d.data[i].action.occurred_at
          break
        }
      }
    }
    else if ($this.hasClass('started')) {
      for (var i = 0, l=d.data.length; i<l ;i++) {
        if (d.data[i].action.highlight == "started") {
          that.updated_at   = d.data[i].action.occurred_at
          break
        }
      }
    }

    that.timer  = new Date().getTime() - that.updated_at
    $this.data('timer', that.timer)

    var $timer   = $('<div class="timer"></div>')
      , delta    = that.timer / 1000
      , days     = Math.floor(delta / 86400)
      , hours    = Math.floor(delta / 3600)
      , minutes  = Math.floor(delta / 60)

    if ( days > 1 )
      $timer.addClass('omg-not-ok')
            .append( days + ' days' )
    else if ( days == 1 )
      $timer.addClass('still-ok')
            .append( hours + ' hours' )
    else if ( hours > 0 )
      $timer.addClass('ok')
            .append( hours + ' hours' )
    else
      $timer.addClass('ok')
            .append( minutes + ' minutes')

    $this.find('.timer').remove()
    $this.append($timer)
  })
}

// **************************************************************************
// main loop
// **************************************************************************
function main(){
  $('.delivered, .started').each(function(){
    var $this = $(this)
      , id    = $this.attr('class').match(/\d{7,}/g)[0]
    new Story(id, $this)
  })
}

// **************************************************************************
// initialisation and setting loop
// **************************************************************************
for (var i = 1; i<10; i=i+2) setTimeout(main, i*1000)
setInterval(main, 60000)
$('body').click(function(){setTimeout(main, 1000)})

// **************************************************************************
// style
// **************************************************************************
var $style = $('<style></style>')
$style.attr('type', 'text/css')
      .append('.ok { color: green; }')
      .append('.still-ok   { color: orange; }')
      .append('.omg-not-ok { color: red; }')
      .append('.story      { position: relative; }')
      .append('.delivered .preview { min-height: 38px; }')
      .append('.started .preview { min-height: 38px; }')
      .append('.timer      { position: absolute; top: 24px; left: 4px; font-size: 12px;}')
$('head').append($style)
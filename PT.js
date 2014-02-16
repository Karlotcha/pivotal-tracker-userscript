// ==UserScript==
// @name         PT - timers for stories to test and to finish
// @version      0.4
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
                    '/activity?date_format=millis&envelope=true'

  this.delivered_at = $this.data('delivered_at')
  this.started_at   = $this.data('started_at')

  if ($this.hasClass('delivered') && !$this.data('.delivered_at')) {
    $.get(pt_api_url, function(d){
      for (var i = 0, l=d.data.length; i<l ;i++) {
        if (d.data[i].highlight == "delivered") {
          that.delivered_at = d.data[i].occurred_at
          break
        }
      }
      that.display($this)
    })
  }
  else if ($this.hasClass('started') && !$this.data('.started_at')) {
    $.get(pt_api_url, function(d){
      for (var i = 0, l=d.data.length; i<l ;i++) {
        if (d.data[i].highlight == "started") {
          that.started_at = d.data[i].occurred_at
          break
        }
      }
      that.display($this)
    })
  }
}

Story.prototype.display = function ($this) {
  $this.data('delivered_at', this.delivered_at)
  $this.data('started_at', this.started_at)
  this.timer_create  = new Date().getTime() - this.delivered_at
  this.timer_start   = new Date().getTime() - this.started_at

  if ($this.hasClass('delivered'))
    var $timer   = $('<div class="timer timer-deliver"></div>')
      , delta    = this.timer_create / 1000
  else if ($this.hasClass('started'))
    var $timer   = $('<div class="timer timer-start"></div>')
      , delta    = this.timer_start / 1000

  var days     = Math.floor(delta / 86400)
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
          .append( minutes + ' minutes' )

  $this.find('.timer').remove()
  $this.append($timer)
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
      .append('.timer { position: absolute; top: 24px; left: 4px; font-size: 12px;}')
$('head').append($style)

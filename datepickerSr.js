var datepickerSr = null;
var numberBody = 0;

// Constructor
$(function() {
    initDatepickerSr();
})

function initDatepickerSr() {
    var inputSrPicker = $('input.date-pickersr[type=text]');
    if (inputSrPicker.length > 0) {
        datepickerSr = new DatepickerSR(inputSrPicker);
        datepickerSr.construct();
    }
}

// Events
$(document).on('click', '.date-picker-container .item-date', function() {
    datepickerSr.choice($(this));
});

$(document).on('click', '.flexibility-item', function() {
    datepickerSr.flexibility($(this));
});

$(document).on('focus', 'input.date-pickersr[type=text]', function(e) {
    var parent = $(this).parent();
    var container = parent.find('.date-picker-container');
    container.addClass('open');
});

$(document).click(function(event) { 
    var $target = $(event.target);
    if(!$target.closest('.date-picker-container').length && !$target.hasClass('date-pickersr')) {
        $('.date-picker-container').removeClass('open');
    }
});

$(document).on('click', '.date-picker-arrow', function() {
    var direction = $(this).attr('data-direction');
    var parent = $(this).closest('.date-picker-container');
    var body = parent.find('.date-picker-container-body');

    var firstActive = body.find('.date-picker-container-panel.active').first();
    var lastActive = body.find('.date-picker-container-panel.active').last();
    
    if (direction == 'right') {
        var nextActive = lastActive.next('.date-picker-container-panel');
        if (nextActive.length > 0) {
            firstActive.removeClass('active');
            nextActive.addClass('active');
        }
    }

    if (direction == 'left') {
        var prevActive = firstActive.prev('.date-picker-container-panel');
        if (prevActive.length > 0) {
            lastActive.removeClass('active');
            prevActive.addClass('active');
        }
    }
});

function DatepickerSR(element) {
    var self = this;
    var min = element.attr('data-min');
    var max = element.attr('data-max');
    var parent = element.parent();

    var momentMin = moment(min);
    var momentMax = moment(max);

    this.construct = function() {
        var html = '<div class="date-picker-container">'
            + ' <input type="hidden" name="_current_date" value="">'
            + ' <input type="hidden" name="_flexibility" value="0">'
            + this.htmlArrow()
            + this.htmlBody()
            + this.htmlFooter()
            + ' </div>';

        parent.append(html);
        this.displayPanels();
    }

    this.htmlArrow = function() {
        return '<div class="date-picker-arrow left" data-direction="left">'
            + '<svg viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 10px; width: 10px; display: block; fill: currentcolor;"><path d="m13.7 16.29a1 1 0 1 1 -1.42 1.41l-8-8a1 1 0 0 1 0-1.41l8-8a1 1 0 1 1 1.42 1.41l-7.29 7.29z" fill-rule="evenodd"></path></svg>'
            + '</div>'
            + '<div class="date-picker-arrow right" data-direction="right">'
            + '<svg viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 10px; width: 10px; display: block; fill: currentcolor;"><path d="m4.29 1.71a1 1 0 1 1 1.42-1.41l8 8a1 1 0 0 1 0 1.41l-8 8a1 1 0 1 1 -1.42-1.41l7.29-7.29z" fill-rule="evenodd"></path></svg>'
            + '</div>';
    }

    this.htmlBody = function() {
        var html = '<div class="date-picker-container-body" data-number="0">';

        let diffInMonth = momentMax.diff(momentMin, 'months');
        for (let i = 0; i < diffInMonth; i++) {
            var date = momentMin.clone().add(i, 'M');

            html += '<div class="date-picker-container-panel">'
                + '<div class="date-picker-container-panel-title">'+ date.format('MMM') +' '+ date.year() +'</div>'
                + this.panelDays()
                + this.panelDates(date, i >= 1 ? false : true)
                + '</div>';
        }

        html += '</div>';

        return html;
    }

    this.htmlFooter = function() {
        var html = '<div class="date-picker-container-footer">'
            + '<div class="flexibility-container">'
            + '<div class="flexibility-item active" data-value="0">Dates exactes</div>'
            + '<div class="flexibility-item" data-value="1">+- 1 jour</div>'
            + '<div class="flexibility-item" data-value="2">+- 2 jours</div>'
            + '<div class="flexibility-item" data-value="3">+- 3 jours</div>'
            + '<div class="flexibility-item" data-value="7">+- 7 jours</div>';

        return html;
    }

    this.panelDays = function() {
        var html = '<div class="date-picker-container-panel-days">'
            + '<div class="item" data-day="1">lu</div>'
            + '<div class="item" data-day="2">ma</div>'
            + '<div class="item" data-day="3">me</div>'
            + '<div class="item" data-day="4">je</div>'
            + '<div class="item" data-day="5">ve</div>'
            + '<div class="item" data-day="6">sa</div>'
            + '<div class="item" data-day="0">di</div>'
            + '</div>';

        return html;
    }

    this.panelDates = function(date, isMin) {
        let min = date.format('D');
        let startOfMonth = date.clone().startOf('month');
        let endOfMonth = date.clone().endOf('month');
        let dayStart = startOfMonth.day() == 0 ? 7 : startOfMonth.day(); 
        let diff = endOfMonth.diff(startOfMonth, 'days') + 1;

        var html = '<div class="date-picker-container-panel-content" data-year="'+ date.year() +'" data-month="'+ date.format('MM') +'">';
        
        // Add empty value
        for (let j = 1; j < dayStart; j++) {
            html += '<div class="item-date empty"></div>';
        }

        // Add days for month
        for (let i = 1; i <= diff; i++) {
            var disableDate = (isMin && min > i) ? ' disabled' : '';
            html += '<div class="item-date'+ disableDate +'" data-value="'+ i +'">'+ i +'</div>';
        }

        html += '</div>';

        return html;
    }

    // Actions on dtpicker
    this.choice = function(item) {
        var grandParent = element.parent();
        var parent = item.closest('.date-picker-container-panel-content');
        var hiddenInput = grandParent.find('input[name="_current_date"]');
        var year = parent.attr('data-year');
        var month = parent.attr('data-month');
        var day = item.attr('data-value');
        var date = moment(year + '-' + month + '-' + day);

        // Visual actions
        var elements = grandParent.find('.item-date');
        elements.removeClass('active');
        item.addClass('active');

        // Update values
        element.val(date.locale("fr").format('dddd LL'));
        hiddenInput.val(date.format('YYYY-MM-DD'));
    }

    this.flexibility = function(item) {
        var parent = element.parent();
        var value = item.attr('data-value');
        var input = parent.find('input[name=_flexibility]');

        // Visual actions
        var elements = parent.find('.flexibility-item');
        elements.removeClass('active');
        item.addClass('active');

        // Update value
        input.val(value);
    }

    this.displayPanels = function() {
        var width = $(window).width();
        var parent = element.parent();
        var items = parent.find('.date-picker-container-panel');

        if (items.length > 0) {
            if (width <= 992) {
                items.first().addClass('active');
            } else {
                parent.find('.date-picker-container-panel:lt(2)').addClass('active');
            }
        }
    }
}
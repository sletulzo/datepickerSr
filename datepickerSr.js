var datepickerSr = null;

// Constructor
$(function() {
    // initDatepickerSr();
})

function initDatepickerSr() {
    var inputSrPicker = $('input.date-pickersr[type=text]');
    if (inputSrPicker.length > 0) {
        datepickerSr = new DatepickerSR(inputSrPicker);
        datepickerSr.destroy();
        datepickerSr.construct();
    }
}

// Events
$(document).on('click', '.date-picker-container .item-date', function() {
    datepickerSr.choice($(this));
    datepickerSr.flexibilityDate();
});

$(document).on('click', '.flexibility-item', function() {
    datepickerSr.flexibility($(this));
    datepickerSr.flexibilityDate();
});

$(document).on('focus', 'input.date-pickersr[type=text]', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var parent = $(this).parent();
    var container = parent.find('.date-picker-container');
    container.addClass('open');
});

$(document).on('click', '.date-picker-validate', function() {
    datepickerSr.close();
});

$(document).click(function(event) { 
    var $target = $(event.target);
    if(!$target.closest('.date-picker-container').length && !$target.hasClass('date-pickersr') && datepickerSr != undefined) {
        datepickerSr.close();
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
    var name = element.attr('data-name');
    var type = element.attr('data-type') != undefined ? element.attr('data-type') : '';
    var flexibility = element.attr('data-flexibility');
    var value = element.val();
    var parent = element.parent();

    var momentMin = moment(min);
    var momentMax = moment(max);

    this.construct = function() {
        var html = '<div class="date-picker-container '+ type +'">'
            + ' <input type="hidden" class="no-search" name="'+ name +'" value="'+ value +'">'
            + ' <input type="hidden" class="no-search" name="flexibility" value="'+ flexibility +'">'
            + this.htmlArrows()
            + this.htmlBody()
            + this.htmlFooter()
            + ' </div>';

        parent.append(html);
        this.displayPanels();
        this.defaultValue();
    }

    this.htmlArrows = function() {
        return '<div class="date-picker-arrow left" data-direction="left">'
            + '<svg viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 10px; width: 10px; display: block; fill: currentcolor;"><path d="m13.7 16.29a1 1 0 1 1 -1.42 1.41l-8-8a1 1 0 0 1 0-1.41l8-8a1 1 0 1 1 1.42 1.41l-7.29 7.29z" fill-rule="evenodd"></path></svg>'
            + '</div>'
            + '<div class="date-picker-arrow right" data-direction="right">'
            + '<svg viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 10px; width: 10px; display: block; fill: currentcolor;"><path d="m4.29 1.71a1 1 0 1 1 1.42-1.41l8 8a1 1 0 0 1 0 1.41l-8 8a1 1 0 1 1 -1.42-1.41l7.29-7.29z" fill-rule="evenodd"></path></svg>'
            + '</div>';
    }

    this.htmlBody = function() {
        var html = '<div class="date-picker-container-body">';

        let diffInMonth = momentMax.diff(momentMin, 'months');
        for (let i = 0; i < diffInMonth; i++) {
            var date = momentMin.clone().add(i, 'M');

            html += '<div class="date-picker-container-panel">'
                + '<div class="date-picker-container-panel-title">'+ date.locale("fr").format('MMM') +' '+ date.year() +'</div>'
                + this.panelDays()
                + this.panelDates(date, i >= 1 ? false : true)
                + '</div>';
        }

        html += '</div>';

        return html;
    }

    this.htmlFooter = function() {
        var html = '<div class="date-picker-container-footer">'
            + '<div class="flexibility-item-title">Vous ??tes flexible ?</div>'
            + '<div class="flexibility-container">'
            + '<div class="flexibility-item" data-value="1">?? 1 jour</div>'
            + '<div class="flexibility-item" data-value="2">?? 2 jours</div>'
            + '<div class="flexibility-item" data-value="3">?? 3 jours</div>'
            + '<div class="flexibility-item" data-value="7">?? 7 jours</div>'
            + '</div>'
            + '<div class="date-picker-validate">Fermer</div>';

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
        var hiddenInput = grandParent.find('input[name="'+ name +'"]');
        var year = parent.attr('data-year');
        var month = parent.attr('data-month');
        var day = item.attr('data-value');
        var date = moment(year + '-' + month + '-' + day);


        // Visual actions
        let flexibility = grandParent.find('input[name="flexibility"]').val();
        var elements = grandParent.find('.item-date');
        var textFlexibility = flexibility > 0 ? '  ??' + flexibility : '';
        elements.removeClass('active');
        item.addClass('active');

        // Update values
        element.val(date.locale("fr").format('dddd LL') + textFlexibility);
        hiddenInput.val(date.format('YYYY-MM-DD'));
        hiddenInput.trigger('change');
    }

    this.flexibility = function(item) {
        var parent = element.parent();
        var value = item.attr('data-value');
        var input = parent.find('input[name=flexibility]');
        let date = parent.find('input[name="'+ name +'"]').val();

        // Visual actions
        var elements = parent.find('.flexibility-item');

        if (item.hasClass('active')) {
            value = 0;
            item.removeClass('active');
        } else {
            elements.removeClass('active');
            item.addClass('active');
        }

        // Update value
        input.val(value);
        input.trigger('change');

        if (date != '') {
            var textFlexibility = value > 0 ? '  ??' + value : '';
            date = moment(date);
            element.val(date.locale("fr").format('dddd LL') + textFlexibility);
        }
    }

    // Display panel date according to screen width
    this.displayPanels = function(panel) {
        var width = $(window).width();
        var parent = element.parent();
        var items = parent.find('.date-picker-container-panel');

        if (items.length > 0) {
            if (width <= 992) {
                if (panel != undefined) {
                    items.removeClass('active');
                    panel.addClass('active');
                } else {
                    items.first().addClass('active');
                }
            } else {
                if (panel != undefined) {
                    items.removeClass('active');
                    panel.addClass('active');

                    if (panel.next('.date-picker-container-panel').length > 0) {
                        panel.next('.date-picker-container-panel').addClass('active');
                    }
                } else {
                    parent.find('.date-picker-container-panel:lt(2)').addClass('active');
                }
            }
        }
    }

    // Default value on load
    this.defaultValue = function() {
        var parent = element.parent();
        var hiddenInput = parent.find('input[name="'+ name +'"]');
        var textFlexibility = '';

        // Default flexibility
        if (flexibility != undefined && flexibility != '') {
            var itemFlex = parent.find('.flexibility-item[data-value="'+ flexibility +'"]');
            if (itemFlex.length > 0) {
                parent.find('.flexibility-item').removeClass('active');
                itemFlex.addClass('active');
                textFlexibility = '  ??' + flexibility;
            }
        }

        // Default date
        if (value != undefined && value != '') {
            var isOnRange = true;
            var valueDate = moment(value);

            if (momentMin && momentMin > valueDate) {
                isOnRange = false;
            }

            if (momentMax && momentMax < valueDate) {
                isOnRange = false;
            }

            if (isOnRange) {
                element.val(valueDate.locale("fr").format('dddd LL') + textFlexibility);

                // Select default on picker
                var panel = parent.find('.date-picker-container-panel-content[data-year="'+ valueDate.year() +'"][data-month="'+ valueDate.format('MM') +'"]');
    
                if (panel.length > 0) {
                    var panelParent = panel.closest('.date-picker-container-panel');
                    var day = valueDate.date();
                    var itemDate = panel.find('.item-date[data-value="'+ day +'"]');
    
                    if (itemDate.length > 0) {
                        itemDate.addClass('active');
                        this.displayPanels(panelParent);
                    }
                }
            } else {
                element.attr('value', '');
                hiddenInput.attr('value', '');
            }
        }

        this.flexibilityDate();
    }

    // Display flexibility on date
    this.flexibilityDate = function() {
        var parent = element.parent();
        var container = parent.find('.date-picker-container');
        var items = container.find('.item-date');

        let date = container.find('input[name="'+ name +'"]').val();
        let flexibility = container.find('input[name="flexibility"]').val();

        // Remove all flexibilities item
        items.removeClass('flex-active');

        if (date != '' && flexibility != '') {
            var active = container.find('.item-date.active');
            var panel = active.closest('.date-picker-container-panel');

            if (active.length > 0) {
                flexactiveNext = active.nextAll(':not(.empty):not(.disabled):lt('+flexibility+')');
                flexactiveNext.addClass('flex-active');
                if (flexibility > flexactiveNext.length) {
                    var nextPanel = panel.next('.date-picker-container-panel')
                    if (nextPanel.length > 0) {
                        var rest = flexibility - flexactiveNext.length;
                        var flexactiveNext = nextPanel.find('.item-date:not(.empty):not(.disabled):lt('+ rest +')');
                        flexactiveNext.addClass('flex-active');
                    }
                }
                
                flexactivePrev = active.prevAll(':not(.empty):not(.disabled):lt('+flexibility+')');
                flexactivePrev.addClass('flex-active');
                if (flexibility > flexactivePrev.length) {
                    var prevPanel = panel.prev('.date-picker-container-panel')
                    if (prevPanel.length > 0) {
                        var rest = flexibility - flexactivePrev.length;
                        var flexactivePrev = prevPanel.find('.item-date:not(.empty):not(.disabled)').slice(-rest);
                        flexactivePrev.addClass('flex-active');
                    }
                }
            }
        }
    }

    // Close 
    this.close = function() {
        var parent = element.parent();
        var container = parent.find('.date-picker-container');
        container.removeClass('open');
    }

    // Destroy
    this.destroy = function() {
        var parent = element.parent();
        var container = parent.find('.date-picker-container');

        if (container.length > 0) {
            container.remove();
        }
    }
}
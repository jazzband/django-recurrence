django.jQuery(document).ready(function () {
	// Init on all existing recurrence fields
	initRecurrenceWidget();
	// Begin DOM observation for new inline additions
	const targetNode = document.getElementById('container');
	const config = { attributes: false, childList: true, subtree: true };
	observer.observe(targetNode, config);
});

/*
    Method iterates over all textareas with .recurrence-widget class name, excluding the last one with '__prefix__',
    if no parameters provided.
    If specific field item is prvided it will only init this particular field to prevent, unnecessary iterations.
 */
function initRecurrenceWidget($field) {
	if (!$field) {
		const recurrenceFields = django.jQuery(document).find('textarea.recurrence-widget:not([id*="__prefix__"])');
		django.jQuery.each(recurrenceFields, function (index, field) {
			const $field = django.jQuery(field);
			new recurrence.widget.Widget($field.attr('id'), {});
		});
	} else {
		new recurrence.widget.Widget($field.attr('id'), {});
	}
}

/*
    MutationObserver
 */
const callback = function (mutationsList, observer) {
	for (const mutation of mutationsList) {
		if (mutation.type === 'childList') {
			// Check if nodes were added
			const addedNodes = mutation.addedNodes;
			if (addedNodes.length > 0) {
				const $addedRecurrenceField = django.jQuery(addedNodes[0]).find('.recurrence-widget');
				// Length has to be 1, to prevent cases when draging inlines returns length 0 or more than 1.
				if ($addedRecurrenceField.length === 1) {
					initRecurrenceWidget($addedRecurrenceField);
				}
			}
		}
	}
};
const observer = new MutationObserver(callback);

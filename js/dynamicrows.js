/*
DynamicRows 1.3.4
Copyright (c) 2013-2017 Dennis Dohle
Last changes: 29.05.2017
*/
(function($){

	$.fn.dynamicrows = function(options) {

		var $obj = $(this);

		// Einstellungen
		var settings = $.extend({
			row           : 'tr', /* Selector einer Zeile */
			rows          : 'tbody', /* Selector aller Zeilen */
			minrows       : 1, /* Sichtbare Mindestzeilen */
			copyRow       : null, /* Immer bestimmte Zeile kopieren; z.B. 2 } */
			copyValues    : false, /* Beim Klonen Werte übernehmen */
			increment     : null, /* Selector für Auto-Nummerierung der Zeilen */
			handle_add    : '[data-add]:not(.disabled)', /* Selector für Option "neue Zeile" */
			handle_remove : '[data-remove]:not(.disabled)', /* Selector für Option "Zeile löschen" */
			handle_move   : '[data-move]:not(.disabled)', /* Selector für Option "Zeile verschieben" */
			index_start   : 0, /* Start-Index der Formularlemente */
			beforeAdd     : null, /* Event vor dem Einfügen einer neuen Zeile */
			beforeRemove  : null, /* Event vor dem Löschen einer Zeile */
			beforeMove    : null, /* Event vor dem Verschieben einer Zeile */
			afterAdd      : null, /* Event nach dem Einfügen einer neuen Zeile */
			afterRemove   : null, /* Event nach dem Löschen einer Zeile */
			afterMove     : null /* Event nach dem Verschieben einer Zeile */
		}, options);

		// Daten-Attribute berücksichtigen
		var data = $obj.data();
		if (typeof data == 'object') {
			$.each(data, function(key, value) {
				if (typeof settings[ key ] != 'undefined') {
					if (typeof value == 'string' && value.length == 0) { value = true; }
					settings[ key ] = value;
				}
			});
		}

		// Zeilen-Container als Objekt definieren
		settings.rows = $(settings.rows, this);

		// Custom-Event nach neuer Zeile
		if (settings.handle_add) {
			$obj.on('click', settings.handle_add, function(obj) {
				obj.preventDefault();
				addRow(this);
			});
		}

		// Custom-Event nach dem Löschen einer Zeile
		if (settings.handle_remove) {
			$obj.on('click', settings.handle_remove, function(obj) {
				obj.preventDefault();
				removeRow(this);
			});
		}

		// Custom-Event nach Verschiebe-Aktion
		if (settings.handle_move && $(settings.handle_move, settings.rows).length > 0 && jQuery.fn.sortable) {
			var items = [];
			$(settings.handle_move, settings.rows).each(function(){
				items.push( $(this).closest(settings.row) );
			});
			$(settings.rows, this).sortable({
				items: items,
				handle: settings.handle_move,
				start: function(event, ui){
					if (settings.beforeMove) { settings.beforeMove(ui.item); }
				},
				update: function(event, ui){
					updateFormNames();
					if (settings.afterMove) { settings.afterMove(ui.item); }
				}
			});
		}

		// Neue Zeile einfügen
		function addRow(handle) {
			var row = $(handle).closest(settings.row);
			if (settings.beforeAdd) {
				var result = settings.beforeAdd(row);
				if (result === false) return false;
			}
			if (settings.copyRow) {
				var row_new = $(handle).closest(settings.rows).find(settings.row + ':nth-child(' + settings.copyRow + ')').clone(true);
			} else {
				var row_new = row.clone(true);
			}
			if (row_new.length == 0) { return false; }
			cleanFormElems(row_new, true);
			if (settings.copyValues) {
				copyFormElemsValues(row, row_new);
			}
			if ($.fn.datepick) { $('input.datepicker', row_new).datepick('destroy').datepick(); }
			row_new.insertAfter(row);
			updateFormNames();
			if (settings.afterAdd) { settings.afterAdd(row_new); }
		}

		// Zeile löschen
		function removeRow(handle) {
			var row = $(handle).closest(settings.row);
			if (settings.beforeRemove) {
				var result = settings.beforeRemove(row);
				if (result === false) return false;
			}
			var rows = $(row).closest(settings.rows);
			var rows_count = $('> ' + settings.row, rows).length;
			if (rows_count > settings.minrows) {
				row.remove();
				updateFormNames();
				row = null;
			}
			else {
				cleanFormElems(row);
			}
			if (settings.afterRemove) { settings.afterRemove(row); }
		}

		// Array-Indexe der Formularelemente anpassen
		function updateFormNames() {
			// Adding a ? on a quantifier (?, * or +) makes it non-greedy
			var name_regex = /(.*?)(\[\d+?\])(?!\[\d+?\])(.*)/g;
			var current_index = settings.index_start - 1;
			$('> ' + settings.row, settings.rows).each(function(){
				current_index++;
				$(':input', this).each(function(){
					$(this).attr('name', function(i, name) {
						if (name === undefined) return true;
						return name.replace(name_regex, function replacer(match, p1, p2, p3, offset, string){
							return p1 + '[' + current_index + ']' + p3;
						});
					}).removeAttr('id');
				});
				if (settings.increment) {
					$(settings.increment, this).html( current_index + 1 );
				}
			});
		}

		// Array-Indexe der Formularelemente anpassen
		function updateFormNamesOld() {
			var current_index = settings.index_start - 1;
			$('> ' + settings.row, settings.rows).each(function(){
				current_index++;
				$(':input', this).each(function(){
					var old_name = $(this).attr('name');
					if (!old_name) return;
					var old_name_arr = old_name.split('[');
					if (old_name_arr.length > 1) {
						var old_index = old_name_arr[ settings.row_index_pos ].replace(']', '');
						var new_name = old_name.replace(old_name_arr[ settings.row_index_pos ] + '[' + old_index + ']', old_name_arr[ settings.row_index_pos ] + '[' + current_index + ']');
						$(this).attr('name', new_name).removeAttr('id');
					}
				});
				if (settings.increment) {
					$(settings.increment, this).html( current_index + 1);
				}
			});
		}

		// Formular-Werte der kopierten Zeile übernehmen
		function copyFormElemsValues(row, row_new){
			var root = this;
			row.find(':text, textarea, select:not(multiple)').each(function() {
				var $el = $(this);
				var name = $el.attr('name');
				row_new.find('[name="' + name + '"]').val( $el.val() );
			});
			row.find(':checkbox, :radio').each(function() {
				var $el = $(this);
				var name = $el.attr('name');
				row_new.find('[name="' + name + '"]').prop('checked', $el.prop('checked') );
			});
		}

		// Nach den Klonen einer Zeile Formular-Werte zurücksetzen
		function cleanFormElems(row, copy){
			var root = this;
			$('.disabled', row).removeClass('disabled');
			$('input[type="hidden"]', row).val('');
			if (!copy || settings.copyValues === false) {
				$(':text, textarea', row).val('');
				$(':checkbox, :radio', row).prop('checked', false);
				$('select option', row).removeAttr('selected').find(':first').prop('selected', true);
			}
		}

	};

}(jQuery));
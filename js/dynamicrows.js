/*
DynamicRows 1.3.8
Copyright (c) 2013-2018 Dennis Dohle
Last changes: 15.12.2018
*/
(function($){

	$.fn.dynamicrows = function(options) {

		var $obj = $(this);

		// Einstellungen
		var settings = $.extend({
			row                   : 'tr', /* Selector einer Zeile */
			rows                  : 'tbody', /* Selector aller Zeilen */
			minrows               : 1, /* Sichtbare Mindestzeilen */
			copyRow               : null, /* Immer bestimmte Zeile kopieren; z.B. 2 } */
			copyValues            : false, /* Beim Klonen Werte übernehmen */
			increment             : null, /* Selector für Auto-Nummerierung der Zeilen */
			handle_add            : '[data-add]:not(.disabled)', /* Selector für Option "neue Zeile" */
			handle_remove         : '[data-remove]:not(.disabled)', /* Selector für Option "Zeile löschen" */
			handle_move           : '[data-move]:not(.disabled)', /* Selector für Option "Zeile verschieben" */
			index_start           : 0, /* Start-Index der Formularlemente */
			beforeAdd             : null, /* Event vor dem Einfügen einer neuen Zeile */
			beforeRemove          : null, /* Event vor dem Löschen einer Zeile */
			beforeMove            : null, /* Event vor dem Verschieben einer Zeile */
			beforeFormUpdateNames : null, /* Event vor dem Ändern der Formularelementnamen einer Zeile */
			beforeAll             : null, /* Event vor der Änderung einer Zeile */
			afterAdd              : null, /* Event nach dem Einfügen einer neuen Zeile */
			afterRemove           : null, /* Event nach dem Löschen einer Zeile */
			afterMove             : null, /* Event nach dem Verschieben einer Zeile */
			afterFormUpdateNames  : null, /* Event nach dem Ändern der Formularelementnamen einer Zeile */
			afterAll              : null, /* Event nach der Änderung einer Zeile */
			animation            : false, /* Animation für add und remove (fade) */
			animation_speed      : 300  /* Animation-Geschwindigkeit für add und remove (fade) */
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
		var $rows = settings.rows ? $(settings.rows, this) : $obj;

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
		if (settings.handle_move && $(settings.handle_move, settings.rows).length > 0) {
			// Plugin sortable.js (recommended)
			if (typeof Sortable != 'undefined') {
				var el = $(settings.rows, this)[0];

				$(settings.handle_move, settings.rows).each(function() {
					var $row = $(this).closest(settings.row);
					$row.addClass('dynamicrows-row');
					$row.find(settings.handle_move).addClass('dynamicrows-move');
				});

				var sortable = new Sortable(el, {
					handle: '.dynamicrows-move',
					draggable: '.dynamicrows-row',
					onStart: function(event) {
						if (settings.beforeMove) { settings.beforeMove(event.item); }
						if (settings.beforeAll) { settings.beforeAll(event.item); }
					},
					onUpdate: function(event){
						updateFormNames();
						if (settings.afterMove) { settings.afterMove(event.item); }
						if (settings.afterAll) { settings.afterAll(event.item); }
					}
				});
			}
			// Plugin jquery-ui
			else if (jQuery.fn.sortable) {
				var items = [];
				$rows.find( settings.handle_move ).each(function(){
					items.push( $(this).closest(settings.row) );
				});
				$rows.sortable({
					items: items,
					handle: settings.handle_move,
					start: function(event, ui){
						if (settings.beforeMove) { settings.beforeMove(ui.item); }
						if (settings.beforeAll) { settings.beforeAll(ui.item); }
					},

					update: function(event, ui){
						if (!settings.prevent_renaming) {
							updateFormNames();
						}
						if (settings.afterMove) { settings.afterMove(ui.item); }
						if (settings.afterAll) { settings.afterAll(ui.item); }
					}
				});
			}
			else {
				alert('No sortable-plugin found! Please load sortablejs or jquery-ui (with sortable widget).');
			}
		}

		// Neue Zeile einfügen
		function addRow(handle) {
			var $row = $(handle).closest(settings.row);

			// autocompleteInput Plugin berücksichtigen
			if ($.fn.autocompleteInput) {
				$rows.find('input[data-autocomplete-input]').autocompleteInput('destroy');
			}

			if (settings.beforeAdd) {
				var result = settings.beforeAdd($row);
				if (result === false) return false;
			}

			if (settings.copyRow) {
				var $row_new = $(handle).closest(settings.rows).children(settings.row + ':nth-child(' + settings.copyRow + ')').clone(true);
			}
			else {
				var $row_new = $row.clone(true);
			}

			if (!$row_new.length) { return false; }

			cleanFormElems($row_new, true);

			if (settings.copyValues) {
				copyFormElemsValues($row, $row_new);
			}

			// datepick Plugin berücksichtigen
			if ($.fn.datepick) {
				$row_new.find('input.datepicker').datepick('destroy');
			}

			if (settings.animation == 'fade') {
				$row_new.hide().insertAfter($row);
				$row_new.fadeIn(settings.animation_speed);
			}
			else {
				$row_new.insertAfter($row);
			}

			if (!settings.prevent_renaming) {
				updateFormNames();
			}

			// datepick Plugin berücksichtigen
			if ($.fn.datepick) {
				$row_new.find('input.datepicker').datepick();
			}

			// autocompleteInput Plugin berücksichtigen
			if ($.fn.autocompleteInput) {
				$rows.find('input[data-autocomplete-input]').autocompleteInput();
			}

			if (settings.afterAdd) { settings.afterAdd($row_new); }
			if (settings.afterAll) { settings.afterAll($row_new); }
		}

		// Zeile löschen
		function removeRow(handle) {
			var $row = $(handle).closest(settings.row);
			if (settings.beforeRemove) {
				var result = settings.beforeRemove($row);
				if (result === false) return false;
			}
			var rows_count = $rows.children(settings.row).length;
			if (rows_count > settings.minrows) {
				if (settings.animation == 'fade') {
					$row.fadeOut(settings.animation_speed, function() {
						$(this).remove();
					});
				}
				else {
					$row.remove();
				}
				if (!settings.prevent_renaming) {
					updateFormNames();
				}
				$row = null;
			}
			else {
				cleanFormElems($row);

				// autocompleteInput Plugin berücksichtigen
				if ($.fn.autocompleteInput) {
					$row.find('input[data-autocomplete-input]').autocompleteInput('deselect');
				}
			}
			if (settings.afterRemove) { settings.afterRemove($row); }
			if (settings.afterAll) { settings.afterAll($row); }
		}

		// Array-Indexe der Formularelemente anpassen
		function updateFormNames() {
			// Adding a ? on a quantifier (?, * or +) makes it non-greedy
			var name_regex = /(.*?)(\[\d+?\])(?!\[\d+?\])(.*)/g;
			var current_index = settings.index_start - 1;
			$('> ' + settings.row, settings.rows).each(function(){
				var $row = $(this);
				if (settings.beforeFormUpdateNames) {
					settings.beforeFormUpdateNames( $row );
				}
				current_index++;
				$row.find(':input').each(function(){
					$(this).attr('name', function(i, name) {
						if (name === undefined) return true;
						return name.replace(name_regex, function replacer(match, p1, p2, p3, offset, string){
							return p1 + '[' + current_index + ']' + p3;
						});
					}).removeAttr('id');
				});
				if (settings.increment) {
					$row.find(settings.increment).html( current_index + 1 );
				}
				if (settings.afterFormUpdateNames) {
					settings.afterFormUpdateNames( $row );
				}
			});
		}

		// Formular-Werte der kopierten Zeile übernehmen
		function copyFormElemsValues($row, $row_new){
			var root = this;
			$row.find(':text, textarea, select:not(multiple)').each(function() {
				var $el = $(this);
				var name = $el.attr('name');
				$row_new.find('[name="' + name + '"]').val( $el.val() );
			});
			$row.find(':checkbox, :radio').each(function() {
				var $el = $(this);
				var name = $el.attr('name');
				$row_new.find('[name="' + name + '"]').prop('checked', $el.prop('checked') );
			});
		}

		// Nach den Klonen einer Zeile Formular-Werte zurücksetzen
		function cleanFormElems($row, copy){
			var root = this;
			$('.disabled', $row).removeClass('disabled');
			$('input[type="hidden"]', $row).val('');
			if (!copy || settings.copyValues === false) {
				$(':text, textarea', $row).val('');
				$(':checkbox, :radio', $row).prop('checked', false);
				$('select', $row).children('option:selected').prop('selected', false);
			}
		}

	};

}(jQuery));
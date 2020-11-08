# dynamicrows
jQuery-plugin for add/remove rows by cloning existing row / renaming form-elements (arrays).

***

### Requirements

* jQuery >=2.0
* if move-action used: sortablejs (recommended) or jQuery UI

***

### Installation

npm:

```
npm install dynamicrows --save
```

Bower (deprecated):

```
bower install debrouchee/dynamicrows --save
```

Or download js/dynamicrows.min.js and include the script on your page like shown below.

***

### Usage

ECMAScript:

```html
require('dynamicrows');
```

or direct include script:

```html
<script src="dynamicrows.min.js"></script>
```

Markup example:

```html
<table data-dynamicrows>
  <thead>
    <tr>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>E-Mail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input type="text" name="contacts[0][firstname]"></td>
      <td><input type="text" name="contacts[0][lastname]"></td>
      <td><input type="text" name="contacts[0][email]"></td>
      <td>
        <i class="fa fa-minus" data-remove></i>
        <i class="fa fa-arrows" data-move></i>
        <i class="fa fa-plus" data-add></i>
      </td>
    </tr>
  </tbody>
</table>
```

Initialize:

```javacript
$(function() {
  $('table[data-dynamicrows]').dynamicrows(options);
});
```

Advanced markup example

```html
<table data-dynamicrows data-increment=".increment" data-row=".row" data-form-prefix="contacts[874]">
  <thead>
    <tr>
      <th>Pos.</th>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>E-Mail</th>
    </tr>
  </thead>
  <tbody>
    <tr class="row">
      <td><span class="increment">1</span>.</td>
      <td><input type="text" name="contacts[874][0][firstname]"></td>
      <td><input type="text" name="contacts[874][0][lastname]"></td>
      <td><input type="text" name="contacts[874][0][email]"></td>
      <td><input type="date" name="contacts[874][0][date]" class="datepicker"></td>
      <td>
        <i class="fa fa-minus" data-remove></i>
        <i class="fa fa-arrows" data-move></i>
        <i class="fa fa-plus" data-add></i>
      </td>
    </tr>
  </tbody>
</table>
```

Initialize:

```javacript
$(function() {
  $('table[data-dynamicrows]').dynamicrows({
    beforeAdd: function($row) {
      let confirm_result = confirm('Möchten Sie wirklich eine neue Zeile hinzufügen?');
      if (!confirm_result) {
        return false;
      }
      $row.find('.datepicker').datepicker('remove');
    },
    afterAdd: function($row) {
      $row.find('.datepicker').datepicker();
    }
  });
});
```


***

### Options

Option                  | Default          | Description
------------------------|------------------|-----------------------------------
`row`                   | `tr`             | row selector
`rows`                  | `tbody`          | rows-container selector
`minrows`               | `1`              | minimum of rows
`copy_row`              | `null`           | row selector for template-row
`copy_values`           | `false`          | if true input-values are copied
`increment`             | `null`           | selector for placing row numbering
`handle_add`            | `[data-add]`     | selector for adding new row
`handle_remove`         | `[data-remove]`  | selector for removing row
`handle_move`           | `[data-move]`    | selector for moving row
`index_start`           | `0`              | starting index for input array names
`form_prefix`           | ``               | prefix of input-elements to be ignored in updateFormNames()
`prevent_renaming`      | `false`          | prevent auto-renaming of input-elements
`animation`             | `false`          | use jQuery animation method (fade)
`animation_speed`       | `300`            | animation speed in milliseconds
`beforeAdd`             | `null`           | callback function
`beforeRemove`          | `null`           | callback function
`beforeFormUpdateNames` | `null`           | callback function
`beforeAll`             | `null`           | callback function
`beforeMove`            | `null`           | callback function
`afterAdd`              | `null`           | callback function
`afterRemove`           | `null`           | callback function
`afterMove`             | `null`           | callback function
`afterFormUpdateNames`  | `null`           | callback function
`afterAll`              | `null`           | callback function

***

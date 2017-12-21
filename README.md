# dynamicrows
jQuery-plugin for add/remove rows by cloning existing row / renaming form-elements (arrays)

***

### Requirements

* jQuery >=1.8
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

Markup (example):

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
  $('[data-dynamicrows]').dynamicrows(options);
});
```

***

### Options

Option                  | Default          | Description
------------------------|------------------|-----------------------------------
`row`                   | `tr`             | row selector
`rows`                  | `tbody`          | rows-container selector
`minrows`               | `1`              | minimum of rows
`copyRow`               | `null`           | row selector for template-row
`copyValues`            | `false`          | if true input-values are copied
`increment`             | `null`           | selector for placing row numbering
`handle_add`            | `[data-add]`     | selector for adding new row
`handle_remove`         | `[data-remove]`  | selector for removing row
`handle_move`           | `[data-move]`    | selector for moving row
`index_start`           | `0`              | starting index for input-arrays
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

### Example for callback-usage

```javacript
$(function() {
  $('[data-dynamicrows]').dynamicrows({
    beforeAdd: function($row) {
      $row.find('.datepicker)'.datepicker('remove');
    },
    afterAdd: function($row) {
      $row.find('.datepicker)'.datepicker();
    }
  });
});
```
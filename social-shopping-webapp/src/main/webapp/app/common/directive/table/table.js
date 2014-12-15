define(['petCommonModule'], function (module) {
    'use strict';

    module.directive('cmpTable', [

        function () {
            return {
                restrict: 'E',
                require: 'ngModel',
                templateUrl: 'app/common/directive/table/table.html',
                scope: {
                    'loadMore': '&tableLoadMore',
                    'config': '&tableConfig',
                    'buttonConfig': '=?tableButtonConfig',
                    'deleteable': '=?tableDeleteable',
                    'addable': '=?tableAddable',
                    'selectable': '=?tableSelectable',
                    'sort': '=tableSort',
                    'delete': '&onDelete',
                    'select': '&onSelect',
                    'unselect': '&onUnselect',
                    'add': '&onAdd',
                    'selectionAllowed': '&onSelectionAllowed',
                    'page': '='
                },
                replace: true,
                link: function link(scope, el, attr, ngModel) {
                    scope.config = scope.config();

                    var unwatch =
                        scope.$watch(function () {
                            return ngModel.$modelValue;
                        }, function () {
                            ngModel.$render();
                        }, function (mew, old) {
                            return mew === old && mew.length === old.length;
                        });

                    ngModel.$render = function $render() {
                        scope.data = ngModel.$viewValue.data;
                    };

                    function formatModel(model) {
                        return {
                            'data': model
                        };
                    }

                    function parseView(view) {
                        return view.data;
                    }

                    ngModel.$formatters.unshift(formatModel);
                    ngModel.$parsers.unshift(parseView);

                    // needed for filter stuff
                    scope.search = {};

                    scope.filterSelected = function (row) {
                        return !scope.isSelected(row);
                    };
                    scope.deleteable = !!scope.deleteable;
                    scope.addable = !!scope.addable;
                    scope.selectable = !!scope.selectable;

                    scope.selected = []; // selected indices
                    scope.selectedRow = -1;

                    scope.filterProperty = function filterProperty(property, evt) {
                        if (evt) {
                            var key = evt.keyCode || evt.which;
                            if (key !== 13) {
                                return;
                            }
                        }
                        if (scope.search[property] === '') {
                            delete scope.search[property];
                        }
                        resetData();
                        scope.onLoadMore();
                    };

                    function resetData() {
                        scope.page = 0;
                        // delete everything from data except selected rows
                        for (var i = scope.data.length - 1; i >= 0; i--) {
                            if (!scope.isSelected(scope.data[i])) {
                                scope.data.splice(i, 1);
                            }
                        }
                    }

                    scope.orderBy = function orderBy(evt, property, reverse) {
                        evt.stopPropagation();
                        scope.sort.field = property;
                        scope.sort.reverse = reverse;

                        resetData();
                        scope.onLoadMore();
                    };

                    scope.onLoadMore = function onLoadMore() {
                        if (scope.loadMore) {
                            scope.loadMore({
                                '$page': scope.page++,
                                '$sortAttr': scope.sort.field,
                                '$sortDesc': scope.sort.reverse,
                                '$filter': scope.search
                            });
                        }
                    };

                    // call onDelete callback
                    scope.onDelete = function onDelete(rows) {
                        if (scope.delete) {
                            scope.selected = [];
                            scope.delete({
                                '$rows': rows
                            });
                        }
                    };

                    // call onAdd callback
                    scope.onAdd = function onAdd() {
                        if (scope.add) {
                            scope.add();
                        }
                    };

                    // call onSelect callback
                    scope.onSelect = function onSelect(row) {
                        if (scope.select) {
                            scope.select({
                                '$rowIndex': scope.data.indexOf(row),
                                '$row': row
                            });
                        }
                    };

                    // call callback for unselection
                    scope.onUnselect = function onUnselect() {
                        if (scope.unselect) {
                            scope.unselect();
                        }
                    };

                    // updates the array for selected indices
                    scope.updateSelection = function updateSelection(row, state) {
                        var currentIdx = scope.selected.indexOf(row);
                        if (currentIdx >= 0 && state ||
                            currentIdx < 0 && !state) {
                            return; // nothing to do
                        }
                        if (state) {
                            scope.selected.push(row);
                        } else {
                            scope.selected.splice(currentIdx, 1);
                        }
                    };

                    scope.selectRow = function selectRow(row) {
                        if(angular.isFunction(scope.selectionAllowed)){
                            scope.selectionAllowed().then(function() {
                                scope.performSelectRow(row);
                            });
                        }else{
                            scope.performSelectRow(row);
                        }
                    };

                    scope.performSelectRow = function performSelectRow(row){
                        if (scope.selectedRow === row) {
                            scope.selectedRow = null;
                            scope.onUnselect();
                            return;
                        }
                        scope.selectedRow = row;
                        scope.onSelect(row);
                    };

                    // alters the visual state of the row and calls for updateSelection
                    scope.toggleSelection = function toggleSelection(evt, row) {
                        // stop propagation
                        // otherwise the row would be selected too because the
                        // event bubbles up the DOM
                        evt.stopPropagation();
                        scope.updateSelection(row, scope.selected.indexOf(row) < 0);
                    };

                    // returns true if no row is selected
                    scope.isSelectionEmpty = function isSelectionEmpty() {
                        return scope.selected.length === 0;
                    };

                    // returns whether a row is selected or not
                    scope.isSelected = function isSelected(row) {
                        return scope.selected.indexOf(row) >= 0;
                    };

                    // logic for toggle all button
                    scope.toggleAll = function toggleAll() {
                        if (scope.selected.length < scope.data.length) {
                            // if we didn't already select all items, do so now
                            scope.data.forEach(function (item) {
                                scope.updateSelection(item, true);
                            });
                        } else {
                            scope.data.forEach(function (item) {
                                scope.updateSelection(item, false);
                            });
                        }
                    };

                    scope.$on('$destroy', function () {
                        unwatch();
                    });
                }
            };
        }
    ]);
});

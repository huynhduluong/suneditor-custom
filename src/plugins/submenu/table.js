/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'table',
    display: 'submenu',
    add: function (core, targetElement) {
        const context = core.context;
        let contextTable = context.table = {
            _element: null,
            _tdElement: null,
            _trElement: null,
            _trElements: null,
            _tableXY: [],
            _maxWidth: true,
            _fixedColumn: false,
            _rtl: core.options.rtl,
            cellControllerTop: core.options.tableCellControllerPosition === 'top',
            resizeText: null,
            headerButton: null,
            mergeButton: null,
            splitButton: null,
            addBorderButton: null,
            removeBorderButton: null,
            fillColorButton: null,
            splitMenu: null,
            addBorderMenu: null,
            removeBorderMenu: null,
            fillColorMenu: null,
            maxText: core.lang.controller.maxSize,
            minText: core.lang.controller.minSize,
            _physical_cellCnt: 0,
            _logical_cellCnt: 0,
            _rowCnt: 0,
            _rowIndex: 0,
            _physical_cellIndex: 0,
            _logical_cellIndex: 0,
            _current_colSpan: 0,
            _current_rowSpan: 0,
            icons: {
                expansion: core.icons.expansion,
                reduction: core.icons.reduction
            }
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);
        let tablePicker = listDiv.querySelector('.se-controller-table-picker');

        contextTable.tableHighlight = listDiv.querySelector('.se-table-size-highlighted');
        contextTable.tableUnHighlight = listDiv.querySelector('.se-table-size-unhighlighted');
        contextTable.tableDisplay = listDiv.querySelector('.se-table-size-display');
        if (core.options.rtl) contextTable.tableHighlight.style.left = (10 * 18 - 13) + 'px';

        /** set table controller */
        let tableController = this.setController_table(core);
        contextTable.tableController = tableController;
        contextTable.resizeButton = tableController.querySelector('._se_table_resize');
        contextTable.resizeText = tableController.querySelector('._se_table_resize > span > span');
        contextTable.columnFixedButton = tableController.querySelector('._se_table_fixed_column');
        contextTable.headerButton = tableController.querySelector('._se_table_header');

        /** set resizing */
        let resizeDiv = this.setController_tableEditor(core, contextTable.cellControllerTop);
        contextTable.resizeDiv = resizeDiv;
        contextTable.splitMenu = resizeDiv.querySelector('.se-btn-group-sub');
        contextTable.addBorderMenu = resizeDiv.querySelector('.se-btn-group-sub_addborder');
        contextTable.removeBorderMenu = resizeDiv.querySelector('.se-btn-group-sub_removeborder');
        contextTable.fillColorMenu = resizeDiv.querySelector('.se-btn-group-sub_fillcolor');
        contextTable.mergeButton = resizeDiv.querySelector('._se_table_merge_button');
        contextTable.splitButton = resizeDiv.querySelector('._se_table_split_button');
        contextTable.addBorderButton = resizeDiv.querySelector('._se_table_addborder_button');
        contextTable.removeBorderButton = resizeDiv.querySelector('._se_table_removeborder_button');
        contextTable.fillColorButton = resizeDiv.querySelector('._se_table_removeborder_button');
        contextTable.insertRowAboveButton = resizeDiv.querySelector('._se_table_insert_row_a');
        contextTable.insertRowBelowButton = resizeDiv.querySelector('._se_table_insert_row_b');

        /** add event listeners */
        tablePicker.addEventListener('mousemove', this.onMouseMove_tablePicker.bind(core, contextTable));
        tablePicker.addEventListener('click', this.appendTable.bind(core));
        resizeDiv.addEventListener('click', this.onClick_tableController.bind(core));
        tableController.addEventListener('click', this.onClick_tableController.bind(core));

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** append controller */
        context.element.relative.appendChild(resizeDiv);
        context.element.relative.appendChild(tableController);

        /** empty memory */
        listDiv = null, tablePicker = null, resizeDiv = null, tableController = null, contextTable = null;

    },

    setSubmenu: function (core) {
        const listDiv = core.util.createElement('DIV');
        listDiv.className = 'se-submenu se-selector-table';
        listDiv.innerHTML = '' +
            '<div class="se-table-size">' +
            '<div class="se-table-size-picker se-controller-table-picker"></div>' +
            '<div class="se-table-size-highlighted"></div>' +
            '<div class="se-table-size-unhighlighted"></div>' +
            '</div>' +
            '<div class="se-table-size-display">1 x 1</div>';

        return listDiv;
    },

    setController_table: function (core) {
        const lang = core.lang;
        const icons = core.icons;
        const tableResize = core.util.createElement('DIV');

        tableResize.className = 'se-controller se-controller-table';
        tableResize.innerHTML = '' +
            '<div>' +
            '<div class="se-btn-group">' +
            '<button type="button" data-command="resize" class="se-btn se-tooltip _se_table_resize">' +
            icons.expansion +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.maxSize + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="layout" class="se-btn se-tooltip _se_table_fixed_column">' +
            icons.fixed_column_width +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.fixedColumnWidth + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="header" class="se-btn se-tooltip _se_table_header">' +
            icons.table_header +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.tableHeader + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="remove" class="se-btn se-tooltip">' +
            icons.delete +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
            '</button>' +
            '</div>' +
            '</div>';

        return tableResize;
    },
    _makeColorList: function () {
        const colorList = [
            '#FFFFFF', '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd',
            '#000000', '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa',
            '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd',
            '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
            '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535',
            '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#f1f1f1',
        ];
        let list = '';

        list += '<ul class="se-color-pallet" style="display: flex;flex-wrap:wrap;">';
        for (let i = 0, len = colorList.length, color; i < len; i++) {
            color = colorList[i];
            if (typeof color === 'string') {
                list += '<li data-command="fillcolor" data-value="' + color + '" title="' + color + '" aria-label="' + color + '">' +
                    '<button type="button" data-command="fillcolor" data-value="' + color + '" title="' + color + '" aria-label="' + color + '" style="background-color:' + color + ';"></button>' +
                    '</li>';
            }
        }
        list += '</ul>';

        return list;
    },

    setController_tableEditor: function (core, cellControllerTop) {
        const lang = core.lang;
        const icons = core.icons;
        const colorArea = this._makeColorList();
        const tableResize = core.util.createElement('DIV');
        tableResize.className = 'se-controller se-controller-table-cell';
        tableResize.innerHTML = (cellControllerTop ? '' : '<div class="se-arrow se-arrow-up"></div>') +
            '<div class="se-btn-group">' +
            '<button type="button" data-command="insert" data-value="row" data-option="up" class="se-btn se-tooltip _se_table_insert_row_a">' +
            icons.insert_row_above +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.insertRowAbove + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="insert" data-value="row" data-option="down" class="se-btn se-tooltip _se_table_insert_row_b">' +
            icons.insert_row_below +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.insertRowBelow + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="delete" data-value="row" class="se-btn se-tooltip">' +
            icons.delete_row +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.deleteRow + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="merge" class="_se_table_merge_button se-btn se-tooltip" disabled>' +
            icons.merge_cell +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.mergeCells + '</span></span>' +
            '</button>' +
            '</div>' +
            '<div class="se-btn-group" style="padding-top: 0;">' +
            '<button type="button" data-command="insert" data-value="cell" data-option="left" class="se-btn se-tooltip">' +
            icons.insert_column_left +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.insertColumnBefore + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="insert" data-value="cell" data-option="right" class="se-btn se-tooltip">' +
            icons.insert_column_right +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.insertColumnAfter + '</span></span>' +
            '</button>' +
            '<button type="button" data-command="delete" data-value="cell" class="se-btn se-tooltip">' +
            icons.delete_column +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.deleteColumn + '</span></span>' +
            '</button>' +

            '<button type="button" data-command="onsplit" class="_se_table_split_button se-btn se-tooltip">' +
            icons.split_cell +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.splitCells + '</span></span>' +
            '</button>' +
            '<div class="se-btn-group-sub sun-editor-common se-list-layer se-table-split">' +
            '<div class="se-list-inner">' +
            '<ul class="se-list-basic">' +
            '<li class="se-btn-list" data-command="split" data-value="vertical" style="line-height:32px;" title="' + lang.controller.VerticalSplit + '" aria-label="' + lang.controller.VerticalSplit + '">' +
            lang.controller.VerticalSplit + '</li>' +
            '<li class="se-btn-list" data-command="split" data-value="horizontal" style="line-height:32px;" title="' + lang.controller.HorizontalSplit + '" aria-label="' + lang.controller.HorizontalSplit + '">' +
            lang.controller.HorizontalSplit + '</li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>' +
            //custom button
            // Fill Color
            '<div class="se-btn-group" style="padding-top: 0;">' +
            '<button type="button" data-command="onfillcolor" data-value="row" data-option="up" class="se-btn se-tooltip _se_table_insert_row_a">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.66 15.74"><g><path d="M12.32,9.31,13.38,13H11.21l.52-1.83q.46-1.61.54-1.83ZM4.44,3.76H20.1V19.5H4.44V3.76ZM14.71,17.32h2.63L13.7,6H10.89L7.26,17.32H9.89l.63-2.24h3.55l.32,1.12c.18.65.29,1,.32,1.12Z" transform="translate(-4.44 -3.76)"/></g></svg>' +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">Fill color</span></span>' +
            '</button>' +
            '<div class="se-btn-group-sub_fillcolor sun-editor-common se-list-layer se-table-fillcolor">' +
            '<div class="se-list-inner">' +
            colorArea +
            '</div>' +
            '</div>' +

            //Add border
            '<button type="button" data-command="onaddborder" class="_se_table_addborder_button se-btn se-tooltip">' +
            "AB" +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">Add borders</span></span>' +
            '</button>' +
            '<div class="se-btn-group-sub_addborder sun-editor-common se-list-layer se-table-addborder">' +
            '<div class="se-list-inner">' +
            '<ul class="se-list-basic">' +
            '<li class="se-btn-list" data-command="addborder" data-value="all" style="line-height:32px;" title="All" aria-label="All">All</li>' +
            '<li class="se-btn-list" data-command="addborder" data-value="left" style="line-height:32px;" title="Left" aria-label="Left">Left</li>' +
            '<li class="se-btn-list" data-command="addborder" data-value="right" style="line-height:32px;" title="Right" aria-label="Right">Right</li>' +
            '<li class="se-btn-list" data-command="addborder" data-value="top" style="line-height:32px;" title="Top" aria-label="Top">Top</li>' +
            '<li class="se-btn-list" data-command="addborder" data-value="bottom" style="line-height:32px;" title="Bottom" aria-label="Bottom">Bottom</li>' +

            '</ul>' +
            '</div>' +
            '</div>' +

            //Remove border
            '<button type="button" data-command="onremoveborder" class="_se_table_removeborder_button se-btn se-tooltip">' +
            "RB" +
            '<span class="se-tooltip-inner"><span class="se-tooltip-text">Remove borders</span></span>' +
            '</button>' +
            '<div class="se-btn-group-sub_removeborder sun-editor-common se-list-layer se-table-removeborder">' +
            '<div class="se-list-inner">' +
            '<ul class="se-list-basic">' +
            '<li class="se-btn-list" data-command="removeborder" data-value="all" style="line-height:32px;" title="All" aria-label="All">All</li>' +
            '<li class="se-btn-list" data-command="removeborder" data-value="left" style="line-height:32px;" title="Left" aria-label="Left">Left</li>' +
            '<li class="se-btn-list" data-command="removeborder" data-value="right" style="line-height:32px;" title="Right" aria-label="Right">Right</li>' +
            '<li class="se-btn-list" data-command="removeborder" data-value="top" style="line-height:32px;" title="Top" aria-label="Top">Top</li>' +
            '<li class="se-btn-list" data-command="removeborder" data-value="bottom" style="line-height:32px;" title="Bottom" aria-label="Bottom">Bottom</li>' +

            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>'
            //end custom button
            ;

        return tableResize;
    },

    appendTable: function () {
        const oTable = this.util.createElement('TABLE');
        const createCells = this.plugins.table.createCells;

        const x = this.context.table._tableXY[0];
        let y = this.context.table._tableXY[1];
        let tableHTML = '<tbody>';
        while (y > 0) {
            tableHTML += '<tr>' + createCells.call(this, 'td', x) + '</tr>';
            --y;
        }
        tableHTML += '</tbody>';
        oTable.innerHTML = tableHTML;

        const changed = this.insertComponent(oTable, false, true, false);

        if (changed) {
            const firstTd = oTable.querySelector('td div');
            this.setRange(firstTd, 0, firstTd, 0);
            this.plugins.table.reset_table_picker.call(this);
        }
        const oParagraph = this.util.createElement('P');
        this.insertComponent(oParagraph, false, true, false);
    },

    createCells: function (nodeName, cnt, returnElement) {
        nodeName = nodeName.toLowerCase();

        if (!returnElement) {
            let cellsHTML = '';
            while (cnt > 0) {
                cellsHTML += '<' + nodeName + '><div><br></div></' + nodeName + '>';
                cnt--;
            }
            return cellsHTML;
        } else {
            const cell = this.util.createElement(nodeName);
            cell.innerHTML = '<div><br></div>';
            return cell;
        }
    },

    onMouseMove_tablePicker: function (contextTable, e) {
        e.stopPropagation();

        let x = this._w.Math.ceil(e.offsetX / 18);
        let y = this._w.Math.ceil(e.offsetY / 18);
        x = x < 1 ? 1 : x;
        y = y < 1 ? 1 : y;

        if (contextTable._rtl) {
            contextTable.tableHighlight.style.left = (x * 18 - 13) + 'px';
            x = 11 - x;
        }

        contextTable.tableHighlight.style.width = x + 'em';
        contextTable.tableHighlight.style.height = y + 'em';

        // let x_u = x < 5 ? 5 : (x > 9 ? 10 : x + 1);
        // let y_u = y < 5 ? 5 : (y > 9 ? 10 : y + 1);
        // contextTable.tableUnHighlight.style.width = x_u + 'em';
        // contextTable.tableUnHighlight.style.height = y_u + 'em';

        this.util.changeTxt(contextTable.tableDisplay, x + ' x ' + y);
        contextTable._tableXY = [x, y];
    },

    reset_table_picker: function () {
        if (!this.context.table.tableHighlight) return;

        const highlight = this.context.table.tableHighlight.style;
        const unHighlight = this.context.table.tableUnHighlight.style;

        highlight.width = '1em';
        highlight.height = '1em';
        unHighlight.width = '10em';
        unHighlight.height = '10em';

        this.util.changeTxt(this.context.table.tableDisplay, '1 x 1');
        this.submenuOff();
    },

    initResizer: function (oTable) {
        if (oTable != null) {

            const cols = oTable.querySelectorAll('td');

            var createResizableColumn = (col, resizer) => {
                // Track the current position of mouse
                let x = 0;
                let w = 0;

                const mouseDownHandler = function (e) {
                    // Get the current mouse position
                    x = e.clientX;

                    // Calculate the current width of column
                    const styles = window.getComputedStyle(col);
                    w = parseInt(styles.width, 10);

                    // Attach listeners for document's events
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler.bind(this));
                };

                const mouseMoveHandler = function (e) {
                    // Determine how far the mouse has been moved
                    const dx = e.clientX - x;

                    // Update the width of column
                    col.style.width = `${w + dx}px`;
                };

                // When user releases the mouse, remove the existing event listeners
                const mouseUpHandler = function () {
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                    this.history.push(false);
                };

                resizer.addEventListener('mousedown', mouseDownHandler.bind(this));
            };
            createResizableColumn = createResizableColumn.bind(this)
            cols.forEach(function (col) {
                if (col.querySelectorAll('.sun-editor_resizer').length > 0) return;
                // Create a resizer element
                const resizer = document.createElement('div');
                resizer.contentEditable = false
                resizer.classList.add('sun-editor_resizer');

                // Set the height
                resizer.style.height = `30.88px`;

                // Add a resizer element to the column
                col.appendChild(resizer);

                // Will be implemented in the next section
                createResizableColumn(col, resizer);
            });
        }
    },
    init: function () {
        const contextTable = this.context.table;
        const tablePlugin = this.plugins.table;

        tablePlugin._removeEvents.call(this);

        if (tablePlugin._selectedTable) {
            const selectedCells = tablePlugin._selectedTable.querySelectorAll('.se-table-selected-cell');
            for (let i = 0, len = selectedCells.length; i < len; i++) {
                this.util.removeClass(selectedCells[i], 'se-table-selected-cell');
            }
        }

        let oTable = this.context.table._element
        this.plugins.table.initResizer.call(this, oTable)
        tablePlugin._toggleEditor.call(this, true);

        contextTable._element = null;
        contextTable._tdElement = null;
        contextTable._trElement = null;
        contextTable._trElements = null;
        contextTable._tableXY = [];
        contextTable._maxWidth = true;
        contextTable._fixedColumn = false;
        contextTable._physical_cellCnt = 0;
        contextTable._logical_cellCnt = 0;
        contextTable._rowCnt = 0;
        contextTable._rowIndex = 0;
        contextTable._physical_cellIndex = 0;
        contextTable._logical_cellIndex = 0;
        contextTable._current_colSpan = 0;
        contextTable._current_rowSpan = 0;

        tablePlugin._shift = false;
        tablePlugin._selectedCells = null;
        tablePlugin._selectedTable = null;
        tablePlugin._ref = null;

        tablePlugin._fixedCell = null;
        tablePlugin._selectedCell = null;
        tablePlugin._fixedCellName = null;
    },
    /** table edit controller */
    call_controller_tableEdit: function (tdElement) {
        const tablePlugin = this.plugins.table;
        const contextTable = this.context.table;

        if (!this.getSelection().isCollapsed && !tablePlugin._selectedCell) {
            this.controllersOff();
            this.util.removeClass(tdElement, 'se-table-selected-cell');
            return;
        }

        const tableElement = contextTable._element || this.plugins.table._selectedTable || this.util.getParentElement(tdElement, 'TABLE');
        contextTable._maxWidth = this.util.hasClass(tableElement, 'se-table-size-100') || tableElement.style.width === '100%' || (!tableElement.style.width && !this.util.hasClass(tableElement, 'se-table-size-auto'));
        contextTable._fixedColumn = this.util.hasClass(tableElement, 'se-table-layout-fixed') || tableElement.style.tableLayout === 'fixed';
        tablePlugin.setTableStyle.call(this, contextTable._maxWidth ? 'width|column' : 'width');

        tablePlugin.setPositionControllerTop.call(this, tableElement);
        tablePlugin.setPositionControllerDiv.call(this, tdElement, tablePlugin._shift);

        if (!tablePlugin._shift) this.controllersOn(contextTable.resizeDiv, contextTable.tableController, tablePlugin.init.bind(this), tdElement, 'table');
    },

    setPositionControllerTop: function (tableElement) {
        this.setControllerPosition(this.context.table.tableController, tableElement, 'top', { left: 0, top: 0 });
    },

    setPositionControllerDiv: function (tdElement, reset) {
        const contextTable = this.context.table;
        const resizeDiv = contextTable.resizeDiv;

        this.plugins.table.setCellInfo.call(this, tdElement, reset);

        if (contextTable.cellControllerTop) {
            this.setControllerPosition(resizeDiv, contextTable._element, 'top', { left: contextTable.tableController.offsetWidth, top: 0 });
        } else {
            this.setControllerPosition(resizeDiv, tdElement, 'bottom', { left: 0, top: 0 });
        }
    },

    setCellInfo: function (tdElement, reset) {
        const contextTable = this.context.table;
        const table = contextTable._element = this.plugins.table._selectedTable || this.util.getParentElement(tdElement, 'TABLE');
        if (/THEAD/i.test(table.firstElementChild.nodeName)) {
            this.util.addClass(contextTable.headerButton, 'active');
        } else {
            this.util.removeClass(contextTable.headerButton, 'active');
        }

        if (reset || contextTable._physical_cellCnt === 0) {
            if (contextTable._tdElement !== tdElement) {
                contextTable._tdElement = tdElement;
                contextTable._trElement = tdElement.parentNode;
            }

            const rows = contextTable._trElements = table.rows;
            const cellIndex = tdElement.cellIndex;

            let cellCnt = 0;
            for (let i = 0, cells = rows[0].cells, len = rows[0].cells.length; i < len; i++) {
                cellCnt += cells[i].colSpan;
            }

            // row cnt, row index
            const rowIndex = contextTable._rowIndex = contextTable._trElement.rowIndex;
            contextTable._rowCnt = rows.length;

            // cell cnt, physical cell index
            contextTable._physical_cellCnt = contextTable._trElement.cells.length;
            contextTable._logical_cellCnt = cellCnt;
            contextTable._physical_cellIndex = cellIndex;

            // span
            contextTable._current_colSpan = contextTable._tdElement.colSpan - 1;
            contextTable._current_rowSpan - contextTable._trElement.cells[cellIndex].rowSpan - 1;

            // find logcal cell index
            let rowSpanArr = [];
            let spanIndex = [];
            for (let i = 0, cells, colSpan; i <= rowIndex; i++) {
                cells = rows[i].cells;
                colSpan = 0;
                for (let c = 0, cLen = cells.length, cell, cs, rs, logcalIndex; c < cLen; c++) {
                    cell = cells[c];
                    cs = cell.colSpan - 1;
                    rs = cell.rowSpan - 1;
                    logcalIndex = c + colSpan;

                    if (spanIndex.length > 0) {
                        for (let r = 0, arr; r < spanIndex.length; r++) {
                            arr = spanIndex[r];
                            if (arr.row > i) continue;
                            if (logcalIndex >= arr.index) {
                                colSpan += arr.cs;
                                logcalIndex += arr.cs;
                                arr.rs -= 1;
                                arr.row = i + 1;
                                if (arr.rs < 1) {
                                    spanIndex.splice(r, 1);
                                    r--;
                                }
                            } else if (c === cLen - 1) {
                                arr.rs -= 1;
                                arr.row = i + 1;
                                if (arr.rs < 1) {
                                    spanIndex.splice(r, 1);
                                    r--;
                                }
                            }
                        }
                    }

                    // logcal cell index
                    if (i === rowIndex && c === cellIndex) {
                        contextTable._logical_cellIndex = logcalIndex;
                        break;
                    }

                    if (rs > 0) {
                        rowSpanArr.push({
                            index: logcalIndex,
                            cs: cs + 1,
                            rs: rs,
                            row: -1
                        });
                    }

                    colSpan += cs;
                }

                spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) { return a.index - b.index; });
                rowSpanArr = [];
            }

            rowSpanArr = null;
            spanIndex = null;
        }
    },

    editTable: function (type, option) {
        const tablePlugin = this.plugins.table;
        const contextTable = this.context.table;
        const table = contextTable._element;
        const isRow = type === 'row';

        if (isRow) {
            const tableAttr = contextTable._trElement.parentNode;
            if (/^THEAD$/i.test(tableAttr.nodeName)) {
                if (option === 'up') {
                    return;
                } else if (!tableAttr.nextElementSibling || !/^TBODY$/i.test(tableAttr.nextElementSibling.nodeName)) {
                    table.innerHTML += '<tbody><tr>' + tablePlugin.createCells.call(this, 'td', contextTable._logical_cellCnt, false) + '</tr></tbody>';
                    return;
                }
            }
        }

        // multi
        if (tablePlugin._ref) {
            const positionCell = contextTable._tdElement;
            const selectedCells = tablePlugin._selectedCells;
            // multi - row
            if (isRow) {
                // remove row
                if (!option) {
                    let row = selectedCells[0].parentNode;
                    const removeCells = [selectedCells[0]];

                    for (let i = 1, len = selectedCells.length, cell; i < len; i++) {
                        cell = selectedCells[i];
                        if (row !== cell.parentNode) {
                            removeCells.push(cell);
                            row = cell.parentNode;
                        }
                    }

                    for (let i = 0, len = removeCells.length; i < len; i++) {
                        tablePlugin.setCellInfo.call(this, removeCells[i], true);
                        tablePlugin.editRow.call(this, option);
                    }
                } else { // edit row
                    tablePlugin.setCellInfo.call(this, option === 'up' ? selectedCells[0] : selectedCells[selectedCells.length - 1], true);
                    tablePlugin.editRow.call(this, option, positionCell);
                }
            } else { // multi - cell
                const firstRow = selectedCells[0].parentNode;
                // remove cell
                if (!option) {
                    const removeCells = [selectedCells[0]];

                    for (let i = 1, len = selectedCells.length, cell; i < len; i++) {
                        cell = selectedCells[i];
                        if (firstRow === cell.parentNode) {
                            removeCells.push(cell);
                        } else {
                            break;
                        }
                    }

                    for (let i = 0, len = removeCells.length; i < len; i++) {
                        tablePlugin.setCellInfo.call(this, removeCells[i], true);
                        tablePlugin.editCell.call(this, option);
                    }
                } else { // edit cell
                    let rightCell = null;

                    for (let i = 0, len = selectedCells.length - 1; i < len; i++) {
                        if (firstRow !== selectedCells[i + 1].parentNode) {
                            rightCell = selectedCells[i];
                            break;
                        }
                    }

                    tablePlugin.setCellInfo.call(this, option === 'left' ? selectedCells[0] : rightCell || selectedCells[0], true);
                    tablePlugin.editCell.call(this, option, positionCell);
                }
            }

            if (!option) tablePlugin.init.call(this);
        } // one
        else {
            tablePlugin[isRow ? 'editRow' : 'editCell'].call(this, option);
        }

        // after remove
        if (!option) {
            const children = table.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].children.length === 0) {
                    this.util.removeItem(children[i]);
                    i--;
                }
            }

            if (table.children.length === 0) this.util.removeItem(table);
        }
    },

    editRow: function (option, positionResetElement) {
        const contextTable = this.context.table;
        const remove = !option;

        const up = option === 'up';
        const originRowIndex = contextTable._rowIndex;
        const rowIndex = remove || up ? originRowIndex : originRowIndex + contextTable._current_rowSpan + 1;
        const sign = remove ? -1 : 1;

        const rows = contextTable._trElements;
        let cellCnt = contextTable._logical_cellCnt;

        for (let i = 0, len = originRowIndex + (remove ? -1 : 0), cell; i <= len; i++) {
            cell = rows[i].cells;
            if (cell.length === 0) return;

            for (let c = 0, cLen = cell.length, rs, cs; c < cLen; c++) {
                rs = cell[c].rowSpan;
                cs = cell[c].colSpan;
                if (rs < 2 && cs < 2) continue;

                if (rs + i > rowIndex && rowIndex > i) {
                    cell[c].rowSpan = rs + sign;
                    cellCnt -= cs;
                }
            }
        }

        if (remove) {
            const next = rows[originRowIndex + 1];
            if (next) {
                const spanCells = [];
                let cells = rows[originRowIndex].cells;
                let colSpan = 0;

                for (let i = 0, len = cells.length, cell, logcalIndex; i < len; i++) {
                    cell = cells[i];
                    logcalIndex = i + colSpan;
                    colSpan += cell.colSpan - 1;

                    if (cell.rowSpan > 1) {
                        cell.rowSpan -= 1;
                        spanCells.push({ cell: cell.cloneNode(false), index: logcalIndex });
                    }
                }

                if (spanCells.length > 0) {
                    let spanCell = spanCells.shift();
                    cells = next.cells;
                    colSpan = 0;

                    for (let i = 0, len = cells.length, cell, logcalIndex; i < len; i++) {
                        cell = cells[i];
                        logcalIndex = i + colSpan;
                        colSpan += cell.colSpan - 1;

                        if (logcalIndex >= spanCell.index) {
                            i--, colSpan--;
                            colSpan += spanCell.cell.colSpan - 1;
                            next.insertBefore(spanCell.cell, cell);
                            spanCell = spanCells.shift();
                            if (!spanCell) break;
                        }
                    }

                    if (spanCell) {
                        next.appendChild(spanCell.cell);
                        for (let i = 0, len = spanCells.length; i < len; i++) {
                            next.appendChild(spanCells[i].cell);
                        }
                    }
                }
            }

            contextTable._element.deleteRow(rowIndex);
        } else {
            const newRow = contextTable._element.insertRow(rowIndex);
            newRow.innerHTML = this.plugins.table.createCells.call(this, 'td', cellCnt, false);
        }

        if (!remove) {
            this.plugins.table.setPositionControllerDiv.call(this, positionResetElement || contextTable._tdElement, true);
        } else {
            this.controllersOff();
        }
    },

    editCell: function (option, positionResetElement) {
        const contextTable = this.context.table;
        const util = this.util;
        const remove = !option;

        const left = option === 'left';
        const colSpan = contextTable._current_colSpan;
        const cellIndex = remove || left ? contextTable._logical_cellIndex : contextTable._logical_cellIndex + colSpan + 1;

        const rows = contextTable._trElements;
        let rowSpanArr = [];
        let spanIndex = [];
        let passCell = 0;
        const removeCell = [];
        const removeSpanArr = [];

        for (let i = 0, len = contextTable._rowCnt, row, insertIndex, cells, newCell, applySpan, cellColSpan; i < len; i++) {
            row = rows[i];
            insertIndex = cellIndex;
            applySpan = false;
            cells = row.cells;
            cellColSpan = 0;

            for (let c = 0, cell, cLen = cells.length, rs, cs, removeIndex; c < cLen; c++) {
                cell = cells[c];
                if (!cell) break;

                rs = cell.rowSpan - 1;
                cs = cell.colSpan - 1;

                if (!remove) {
                    if (c >= insertIndex) break;
                    if (cs > 0) {
                        if (passCell < 1 && cs + c >= insertIndex) {
                            cell.colSpan += 1;
                            insertIndex = null;
                            passCell = rs + 1;
                            break;
                        }

                        insertIndex -= cs;
                    }

                    if (!applySpan) {
                        for (let r = 0, arr; r < spanIndex.length; r++) {
                            arr = spanIndex[r];
                            insertIndex -= arr.cs;
                            arr.rs -= 1;
                            if (arr.rs < 1) {
                                spanIndex.splice(r, 1);
                                r--;
                            }
                        }
                        applySpan = true;
                    }
                } else {
                    removeIndex = c + cellColSpan;

                    if (spanIndex.length > 0) {
                        const lastCell = !cells[c + 1];
                        for (let r = 0, arr; r < spanIndex.length; r++) {
                            arr = spanIndex[r];
                            if (arr.row > i) continue;

                            if (removeIndex >= arr.index) {
                                cellColSpan += arr.cs;
                                removeIndex = c + cellColSpan;
                                arr.rs -= 1;
                                arr.row = i + 1;
                                if (arr.rs < 1) {
                                    spanIndex.splice(r, 1);
                                    r--;
                                }
                            } else if (lastCell) {
                                arr.rs -= 1;
                                arr.row = i + 1;
                                if (arr.rs < 1) {
                                    spanIndex.splice(r, 1);
                                    r--;
                                }
                            }
                        }
                    }

                    if (rs > 0) {
                        rowSpanArr.push({
                            rs: rs,
                            cs: cs + 1,
                            index: removeIndex,
                            row: -1
                        });
                    }

                    if (removeIndex >= insertIndex && removeIndex + cs <= insertIndex + colSpan) {
                        removeCell.push(cell);
                    } else if (removeIndex <= insertIndex + colSpan && removeIndex + cs >= insertIndex) {
                        cell.colSpan -= util.getOverlapRangeAtIndex(cellIndex, cellIndex + colSpan, removeIndex, removeIndex + cs);
                    } else if (rs > 0 && (removeIndex < insertIndex || removeIndex + cs > insertIndex + colSpan)) {
                        removeSpanArr.push({
                            cell: cell,
                            i: i,
                            rs: i + rs
                        });
                    }

                    cellColSpan += cs;
                }
            }

            spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) { return a.index - b.index; });
            rowSpanArr = [];

            if (!remove) {
                if (passCell > 0) {
                    passCell -= 1;
                    continue;
                }

                if (insertIndex !== null && cells.length > 0) {
                    newCell = this.plugins.table.createCells.call(this, cells[0].nodeName, 0, true);
                    newCell = row.insertBefore(newCell, cells[insertIndex]);
                }
            }
        }

        if (remove) {
            let removeFirst, removeEnd;
            for (let r = 0, rLen = removeCell.length, row; r < rLen; r++) {
                row = removeCell[r].parentNode;
                util.removeItem(removeCell[r]);
                if (row.cells.length === 0) {
                    if (!removeFirst) removeFirst = util.getArrayIndex(rows, row);
                    removeEnd = util.getArrayIndex(rows, row);
                    util.removeItem(row);
                }
            }

            for (let c = 0, cLen = removeSpanArr.length, rowSpanCell; c < cLen; c++) {
                rowSpanCell = removeSpanArr[c];
                rowSpanCell.cell.rowSpan = util.getOverlapRangeAtIndex(removeFirst, removeEnd, rowSpanCell.i, rowSpanCell.rs);
            }

            this.controllersOff();
        } else {
            this.plugins.table.setPositionControllerDiv.call(this, positionResetElement || contextTable._tdElement, true);
        }
    },

    _closeSplitMenu: null,
    _closeAddBorderMenu: null,
    _closeRemoveBorderMenu: null,
    _closeFillColorMenu: null,
    openSplitMenu: function () {
        this.util.addClass(this.context.table.splitButton, 'on');
        this.context.table.splitMenu.style.display = 'inline-table';

        this.plugins.table._closeSplitMenu = function () {
            this.util.removeClass(this.context.table.splitButton, 'on');
            this.context.table.splitMenu.style.display = 'none';
            this.removeDocEvent('click', this.plugins.table._closeSplitMenu);
            this.plugins.table._closeSplitMenu = null;
        }.bind(this);

        this.addDocEvent('click', this.plugins.table._closeSplitMenu);
    },
    openAddBorderMenu: function () {
        this.util.addClass(this.context.table.addBorderButton, 'on');
        this.context.table.addBorderMenu.style.display = 'inline-table';

        this.plugins.table._closeAddBorderMenu = function () {
            this.util.removeClass(this.context.table.addBorderButton, 'on');
            this.context.table.addBorderMenu.style.display = 'none';
            this.removeDocEvent('click', this.plugins.table._closeAddBorderMenu);
            this.plugins.table._closeAddBorderMenu = null;
        }.bind(this);

        this.addDocEvent('click', this.plugins.table._closeAddBorderMenu);
    },
    openRemoveBorderMenu: function () {
        this.util.addClass(this.context.table.removeBorderButton, 'on');
        this.context.table.removeBorderMenu.style.display = 'inline-table';

        this.plugins.table._closeRemoveBorderMenu = function () {
            this.util.removeClass(this.context.table.removeBorderButton, 'on');
            this.context.table.removeBorderMenu.style.display = 'none';
            this.removeDocEvent('click', this.plugins.table._closeRemoveBorderMenu);
            this.plugins.table._closeRemoveBorderMenu = null;
        }.bind(this);

        this.addDocEvent('click', this.plugins.table._closeRemoveBorderMenu);
    },
    openFillColorMenu: function () {
        this.util.addClass(this.context.table.fillColorButton, 'on');
        this.context.table.fillColorMenu.style.display = 'inline-table';

        this.plugins.table._closeFillColorMenu = function () {
            this.util.removeClass(this.context.table.fillColorButton, 'on');
            this.context.table.fillColorMenu.style.display = 'none';
            this.removeDocEvent('click', this.plugins.table._closeFillColorMenu);
            this.plugins.table._closeFillColorMenu = null;
        }.bind(this);

        this.addDocEvent('click', this.plugins.table._closeFillColorMenu);
    },
    fillColor: function (color) {
        var elements = document.getElementsByClassName('se-table-selected-cell');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor = color;
        }
    },

    addBorder: function (placement) {
        var elements = document.getElementsByClassName('se-table-selected-cell');
        for (var i = 0; i < elements.length; i++) {
            if (placement === 'all')
                elements[i].style.border = "solid #000 1px";
            if (placement === 'top')
                elements[i].style.borderTop = "solid #000 1px";
            if (placement === 'bottom')
                elements[i].style.borderBottom = "solid #000 1px";
            if (placement === 'left')
                elements[i].style.borderLeft = "solid #000 1px";
            if (placement === 'right')
                elements[i].style.borderRight = "solid #000 1px";
        }
    },

    removeBorder: function (placement) {
        var elements = document.getElementsByClassName('se-table-selected-cell');
        for (var i = 0; i < elements.length; i++) {
            if (placement === 'all') {
                elements[i].style.border = "none";
            }
            if (placement === 'top')
                elements[i].style.borderTop = "none";
            if (placement === 'bottom')
                elements[i].style.borderBottom = "none";
            if (placement === 'left')
                elements[i].style.borderLeft = "none";
            if (placement === 'right')
                elements[i].style.borderRight = "none";
        }
    },

    splitCells: function (direction) {
        const util = this.util;
        const vertical = direction === 'vertical';
        const contextTable = this.context.table;
        const currentCell = contextTable._tdElement;
        const rows = contextTable._trElements;
        const currentRow = contextTable._trElement;
        const index = contextTable._logical_cellIndex;
        const rowIndex = contextTable._rowIndex;
        const newCell = this.plugins.table.createCells.call(this, currentCell.nodeName, 0, true);

        // vertical
        if (vertical) {
            const currentColSpan = currentCell.colSpan;
            newCell.rowSpan = currentCell.rowSpan;

            // colspan > 1
            if (currentColSpan > 1) {
                newCell.colSpan = this._w.Math.floor(currentColSpan / 2);
                currentCell.colSpan = currentColSpan - newCell.colSpan;
                currentRow.insertBefore(newCell, currentCell.nextElementSibling);
            } else { // colspan - 1
                let rowSpanArr = [];
                let spanIndex = [];

                for (let i = 0, len = contextTable._rowCnt, cells, colSpan; i < len; i++) {
                    cells = rows[i].cells;
                    colSpan = 0;
                    for (let c = 0, cLen = cells.length, cell, cs, rs, logcalIndex; c < cLen; c++) {
                        cell = cells[c];
                        cs = cell.colSpan - 1;
                        rs = cell.rowSpan - 1;
                        logcalIndex = c + colSpan;

                        if (spanIndex.length > 0) {
                            for (let r = 0, arr; r < spanIndex.length; r++) {
                                arr = spanIndex[r];
                                if (arr.row > i) continue;
                                if (logcalIndex >= arr.index) {
                                    colSpan += arr.cs;
                                    logcalIndex += arr.cs;
                                    arr.rs -= 1;
                                    arr.row = i + 1;
                                    if (arr.rs < 1) {
                                        spanIndex.splice(r, 1);
                                        r--;
                                    }
                                } else if (c === cLen - 1) {
                                    arr.rs -= 1;
                                    arr.row = i + 1;
                                    if (arr.rs < 1) {
                                        spanIndex.splice(r, 1);
                                        r--;
                                    }
                                }
                            }
                        }

                        if (logcalIndex <= index && rs > 0) {
                            rowSpanArr.push({
                                index: logcalIndex,
                                cs: cs + 1,
                                rs: rs,
                                row: -1
                            });
                        }

                        if (cell !== currentCell && logcalIndex <= index && logcalIndex + cs >= index + currentColSpan - 1) {
                            cell.colSpan += 1;
                            break;
                        }

                        if (logcalIndex > index) break;

                        colSpan += cs;
                    }

                    spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) { return a.index - b.index; });
                    rowSpanArr = [];
                }

                currentRow.insertBefore(newCell, currentCell.nextElementSibling);
            }
        } else { // horizontal
            const currentRowSpan = currentCell.rowSpan;
            newCell.colSpan = currentCell.colSpan;

            // rowspan > 1
            if (currentRowSpan > 1) {
                newCell.rowSpan = this._w.Math.floor(currentRowSpan / 2);
                const newRowSpan = currentRowSpan - newCell.rowSpan;

                const rowSpanArr = [];
                const nextRowIndex = util.getArrayIndex(rows, currentRow) + newRowSpan;

                for (let i = 0, cells, colSpan; i < nextRowIndex; i++) {
                    cells = rows[i].cells;
                    colSpan = 0;
                    for (let c = 0, cLen = cells.length, cell, cs, logcalIndex; c < cLen; c++) {
                        logcalIndex = c + colSpan;
                        if (logcalIndex >= index) break;

                        cell = cells[c];
                        cs = cell.rowSpan - 1;
                        if (cs > 0 && cs + i >= nextRowIndex && logcalIndex < index) {
                            rowSpanArr.push({
                                index: logcalIndex,
                                cs: cell.colSpan
                            });
                        }
                        colSpan += cell.colSpan - 1;
                    }
                }

                const nextRow = rows[nextRowIndex];
                const nextCells = nextRow.cells;
                let rs = rowSpanArr.shift();

                for (let c = 0, cLen = nextCells.length, colSpan = 0, cell, cs, logcalIndex, insertIndex; c < cLen; c++) {
                    logcalIndex = c + colSpan;
                    cell = nextCells[c];
                    cs = cell.colSpan - 1;
                    insertIndex = logcalIndex + cs + 1;

                    if (rs && insertIndex >= rs.index) {
                        colSpan += rs.cs;
                        insertIndex += rs.cs;
                        rs = rowSpanArr.shift();
                    }

                    if (insertIndex >= index || c === cLen - 1) {
                        nextRow.insertBefore(newCell, cell.nextElementSibling);
                        break;
                    }

                    colSpan += cs;
                }

                currentCell.rowSpan = newRowSpan;
            } else { // rowspan - 1
                newCell.rowSpan = currentCell.rowSpan;
                const newRow = util.createElement('TR');
                newRow.appendChild(newCell);

                for (let i = 0, cells; i < rowIndex; i++) {
                    cells = rows[i].cells;
                    if (cells.length === 0) return;

                    for (let c = 0, cLen = cells.length; c < cLen; c++) {
                        if (i + cells[c].rowSpan - 1 >= rowIndex) {
                            cells[c].rowSpan += 1;
                        }
                    }
                }

                const physicalIndex = contextTable._physical_cellIndex;
                const cells = currentRow.cells;

                for (let c = 0, cLen = cells.length; c < cLen; c++) {
                    if (c === physicalIndex) continue;
                    cells[c].rowSpan += 1;
                }

                currentRow.parentNode.insertBefore(newRow, currentRow.nextElementSibling);
            }
        }

        this.focusEdge(currentCell);
        this.plugins.table.setPositionControllerDiv.call(this, currentCell, true);
    },

    mergeCells: function () {
        const tablePlugin = this.plugins.table;
        const contextTable = this.context.table;
        const util = this.util;

        const ref = tablePlugin._ref;
        const selectedCells = tablePlugin._selectedCells;
        const mergeCell = selectedCells[0];

        let emptyRowFirst = null;
        let emptyRowLast = null;
        let cs = (ref.ce - ref.cs) + 1;
        let rs = (ref.re - ref.rs) + 1;
        let mergeHTML = '';
        let row = null;

        for (let i = 1, len = selectedCells.length, cell, ch; i < len; i++) {
            cell = selectedCells[i];
            if (row !== cell.parentNode) row = cell.parentNode;

            ch = cell.children;
            for (let c = 0, cLen = ch.length; c < cLen; c++) {
                if (util.isFormatElement(ch[c]) && util.onlyZeroWidthSpace(ch[c].textContent)) {
                    util.removeItem(ch[c]);
                }
            }

            mergeHTML += cell.innerHTML;
            util.removeItem(cell);

            if (row.cells.length === 0) {
                if (!emptyRowFirst) emptyRowFirst = row;
                else emptyRowLast = row;
                rs -= 1;
            }
        }

        if (emptyRowFirst) {
            const rows = contextTable._trElements;
            const rowIndexFirst = util.getArrayIndex(rows, emptyRowFirst);
            const rowIndexLast = util.getArrayIndex(rows, emptyRowLast || emptyRowFirst);
            const removeRows = [];

            for (let i = 0, cells; i <= rowIndexLast; i++) {
                cells = rows[i].cells;
                if (cells.length === 0) {
                    removeRows.push(rows[i]);
                    continue;
                }

                for (let c = 0, cLen = cells.length, cell, rs; c < cLen; c++) {
                    cell = cells[c];
                    rs = cell.rowSpan - 1;
                    if (rs > 0 && i + rs >= rowIndexFirst) {
                        cell.rowSpan -= util.getOverlapRangeAtIndex(rowIndexFirst, rowIndexLast, i, i + rs);
                    }
                }
            }

            for (let i = 0, len = removeRows.length; i < len; i++) {
                util.removeItem(removeRows[i]);
            }
        }

        mergeCell.innerHTML += mergeHTML;
        mergeCell.colSpan = cs;
        mergeCell.rowSpan = rs;

        this.controllersOff();
        tablePlugin.setActiveButton.call(this, true, false);
        tablePlugin.call_controller_tableEdit.call(this, mergeCell);

        util.addClass(mergeCell, 'se-table-selected-cell');
        this.focusEdge(mergeCell);
    },

    toggleHeader: function () {
        const util = this.util;
        const headerButton = this.context.table.headerButton;
        const active = util.hasClass(headerButton, 'active');
        const table = this.context.table._element;

        if (!active) {
            const header = util.createElement('THEAD');
            header.innerHTML = '<tr>' + this.plugins.table.createCells.call(this, 'th', this.context.table._logical_cellCnt, false) + '</tr>';
            table.insertBefore(header, table.firstElementChild);
        } else {
            util.removeItem(table.querySelector('thead'));
        }

        util.toggleClass(headerButton, 'active');

        if (/TH/i.test(this.context.table._tdElement.nodeName)) {
            this.controllersOff();
        } else {
            this.plugins.table.setPositionControllerDiv.call(this, this.context.table._tdElement, false);
        }
    },

    setTableStyle: function (styles) {
        const contextTable = this.context.table;
        const tableElement = contextTable._element;
        let icon, span, sizeIcon, text;

        if (styles.indexOf('width') > -1) {
            icon = contextTable.resizeButton.firstElementChild;
            span = contextTable.resizeText;

            if (!contextTable._maxWidth) {
                sizeIcon = contextTable.icons.expansion;
                text = contextTable.maxText;
                contextTable.columnFixedButton.style.display = 'none';
                this.util.removeClass(tableElement, 'se-table-size-100');
                this.util.addClass(tableElement, 'se-table-size-auto');
            } else {
                sizeIcon = contextTable.icons.reduction;
                text = contextTable.minText;
                contextTable.columnFixedButton.style.display = 'block';
                this.util.removeClass(tableElement, 'se-table-size-auto');
                this.util.addClass(tableElement, 'se-table-size-100');
            }

            this.util.changeElement(icon, sizeIcon);
            this.util.changeTxt(span, text);
        }

        if (styles.indexOf('column') > -1) {
            if (!contextTable._fixedColumn) {
                this.util.removeClass(tableElement, 'se-table-layout-fixed');
                this.util.addClass(tableElement, 'se-table-layout-auto');
                this.util.removeClass(contextTable.columnFixedButton, 'active');
            } else {
                this.util.removeClass(tableElement, 'se-table-layout-auto');
                this.util.addClass(tableElement, 'se-table-layout-fixed');
                this.util.addClass(contextTable.columnFixedButton, 'active');
            }

        }
    },

    setActiveButton: function (fixedCell, selectedCell) {
        const contextTable = this.context.table;

        if (/^TH$/i.test(fixedCell.nodeName)) {
            contextTable.insertRowAboveButton.setAttribute('disabled', true);
            contextTable.insertRowBelowButton.setAttribute('disabled', true);
        } else {
            contextTable.insertRowAboveButton.removeAttribute('disabled');
            contextTable.insertRowBelowButton.removeAttribute('disabled');
        }

        if (!selectedCell || fixedCell === selectedCell) {
            contextTable.splitButton.removeAttribute('disabled');
            contextTable.mergeButton.setAttribute('disabled', true);
        } else {
            contextTable.splitButton.setAttribute('disabled', true);
            contextTable.mergeButton.removeAttribute('disabled');
        }
    },

    // multi selecte
    _bindOnSelect: null,
    _bindOffSelect: null,
    _bindOffShift: null,
    _selectedCells: null,
    _shift: false,
    _fixedCell: null,
    _fixedCellName: null,
    _selectedCell: null,
    _selectedTable: null,
    _ref: null,
    _toggleEditor: function (enabled) {
        this.context.element.wysiwyg.setAttribute('contenteditable', enabled);
        if (enabled) this.util.removeClass(this.context.element.wysiwyg, 'se-disabled');
        else this.util.addClass(this.context.element.wysiwyg, 'se-disabled');
    },

    _offCellMultiSelect: function (e) {
        e.stopPropagation();
        const tablePlugin = this.plugins.table;

        if (!tablePlugin._shift) {
            tablePlugin._removeEvents.call(this);
            tablePlugin._toggleEditor.call(this, true);
        } else if (tablePlugin._initBind) {
            this._wd.removeEventListener('touchmove', tablePlugin._initBind);
            tablePlugin._initBind = null;
        }

        if (!tablePlugin._fixedCell || !tablePlugin._selectedTable) return;

        tablePlugin.setActiveButton.call(this, tablePlugin._fixedCell, tablePlugin._selectedCell);
        tablePlugin.call_controller_tableEdit.call(this, tablePlugin._selectedCell || tablePlugin._fixedCell);

        tablePlugin._selectedCells = tablePlugin._selectedTable.querySelectorAll('.se-table-selected-cell');
        if (tablePlugin._selectedCell && tablePlugin._fixedCell) this.focusEdge(tablePlugin._selectedCell);

        if (!tablePlugin._shift) {
            tablePlugin._fixedCell = null;
            tablePlugin._selectedCell = null;
            tablePlugin._fixedCellName = null;
        }
    },

    _onCellMultiSelect: function (e) {
        this._antiBlur = true;
        const tablePlugin = this.plugins.table;
        const target = this.util.getParentElement(e.target, this.util.isCell);

        if (tablePlugin._shift) {
            if (target === tablePlugin._fixedCell) tablePlugin._toggleEditor.call(this, true);
            else tablePlugin._toggleEditor.call(this, false);
        } else if (!tablePlugin._ref) {
            if (target === tablePlugin._fixedCell) return;
            else tablePlugin._toggleEditor.call(this, false);
        }

        if (!target || target === tablePlugin._selectedCell || tablePlugin._fixedCellName !== target.nodeName ||
            tablePlugin._selectedTable !== this.util.getParentElement(target, 'TABLE')) {
            return;
        }

        tablePlugin._selectedCell = target;
        tablePlugin._setMultiCells.call(this, tablePlugin._fixedCell, target);
    },

    _setMultiCells: function (startCell, endCell) {
        const tablePlugin = this.plugins.table;
        const rows = tablePlugin._selectedTable.rows;
        const util = this.util;

        const selectedCells = tablePlugin._selectedTable.querySelectorAll('.se-table-selected-cell');
        for (let i = 0, len = selectedCells.length; i < len; i++) {
            util.removeClass(selectedCells[i], 'se-table-selected-cell');
        }

        if (startCell === endCell) {
            util.addClass(startCell, 'se-table-selected-cell');
            if (!tablePlugin._shift) return;
        }

        let findSelectedCell = true;
        let spanIndex = [];
        let rowSpanArr = [];
        const ref = tablePlugin._ref = { _i: 0, cs: null, ce: null, rs: null, re: null };

        for (let i = 0, len = rows.length, cells, colSpan; i < len; i++) {
            cells = rows[i].cells;
            colSpan = 0;

            for (let c = 0, cLen = cells.length, cell, logcalIndex, cs, rs; c < cLen; c++) {
                cell = cells[c];
                cs = cell.colSpan - 1;
                rs = cell.rowSpan - 1;
                logcalIndex = c + colSpan;

                if (spanIndex.length > 0) {
                    for (let r = 0, arr; r < spanIndex.length; r++) {
                        arr = spanIndex[r];
                        if (arr.row > i) continue;
                        if (logcalIndex >= arr.index) {
                            colSpan += arr.cs;
                            logcalIndex += arr.cs;
                            arr.rs -= 1;
                            arr.row = i + 1;
                            if (arr.rs < 1) {
                                spanIndex.splice(r, 1);
                                r--;
                            }
                        } else if (c === cLen - 1) {
                            arr.rs -= 1;
                            arr.row = i + 1;
                            if (arr.rs < 1) {
                                spanIndex.splice(r, 1);
                                r--;
                            }
                        }
                    }
                }

                if (findSelectedCell) {
                    if (cell === startCell || cell === endCell) {
                        ref.cs = ref.cs !== null && ref.cs < logcalIndex ? ref.cs : logcalIndex;
                        ref.ce = ref.ce !== null && ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
                        ref.rs = ref.rs !== null && ref.rs < i ? ref.rs : i;
                        ref.re = ref.re !== null && ref.re > i + rs ? ref.re : i + rs;
                        ref._i += 1;
                    }

                    if (ref._i === 2) {
                        findSelectedCell = false;
                        spanIndex = [];
                        rowSpanArr = [];
                        i = -1;
                        break;
                    }
                } else if (util.getOverlapRangeAtIndex(ref.cs, ref.ce, logcalIndex, logcalIndex + cs) && util.getOverlapRangeAtIndex(ref.rs, ref.re, i, i + rs)) {
                    const newCs = ref.cs < logcalIndex ? ref.cs : logcalIndex;
                    const newCe = ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
                    const newRs = ref.rs < i ? ref.rs : i;
                    const newRe = ref.re > i + rs ? ref.re : i + rs;

                    if (ref.cs !== newCs || ref.ce !== newCe || ref.rs !== newRs || ref.re !== newRe) {
                        ref.cs = newCs;
                        ref.ce = newCe;
                        ref.rs = newRs;
                        ref.re = newRe;
                        i = -1;

                        spanIndex = [];
                        rowSpanArr = [];
                        break;
                    }

                    util.addClass(cell, 'se-table-selected-cell');
                }

                if (rs > 0) {
                    rowSpanArr.push({
                        index: logcalIndex,
                        cs: cs + 1,
                        rs: rs,
                        row: -1
                    });
                }

                colSpan += cell.colSpan - 1;
            }

            spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) { return a.index - b.index; });
            rowSpanArr = [];
        }
    },

    _removeEvents: function () {
        const tablePlugin = this.plugins.table;

        if (tablePlugin._initBind) {
            this._wd.removeEventListener('touchmove', tablePlugin._initBind);
            tablePlugin._initBind = null;
        }

        if (tablePlugin._bindOnSelect) {
            this._wd.removeEventListener('mousedown', tablePlugin._bindOnSelect);
            this._wd.removeEventListener('mousemove', tablePlugin._bindOnSelect);
            tablePlugin._bindOnSelect = null;
        }

        if (tablePlugin._bindOffSelect) {
            this._wd.removeEventListener('mouseup', tablePlugin._bindOffSelect);
            tablePlugin._bindOffSelect = null;
        }

        if (tablePlugin._bindOffShift) {
            this._wd.removeEventListener('keyup', tablePlugin._bindOffShift);
            tablePlugin._bindOffShift = null;
        }
    },

    _initBind: null,
    onTableCellMultiSelect: function (tdElement, shift) {
        const tablePlugin = this.plugins.table;

        tablePlugin._removeEvents.call(this);
        this.controllersOff();

        tablePlugin._shift = shift;
        tablePlugin._fixedCell = tdElement;
        tablePlugin._fixedCellName = tdElement.nodeName;
        tablePlugin._selectedTable = this.util.getParentElement(tdElement, 'TABLE');

        const selectedCells = tablePlugin._selectedTable.querySelectorAll('.se-table-selected-cell');
        for (let i = 0, len = selectedCells.length; i < len; i++) {
            this.util.removeClass(selectedCells[i], 'se-table-selected-cell');
        }

        this.util.addClass(tdElement, 'se-table-selected-cell');

        tablePlugin._bindOnSelect = tablePlugin._onCellMultiSelect.bind(this);
        tablePlugin._bindOffSelect = tablePlugin._offCellMultiSelect.bind(this);

        if (!shift) {
            this._wd.addEventListener('mousemove', tablePlugin._bindOnSelect, false);
        } else {
            tablePlugin._bindOffShift = function () {
                this.controllersOn(this.context.table.resizeDiv, this.context.table.tableController, this.plugins.table.init.bind(this), tdElement, 'table');
                if (!tablePlugin._ref) this.controllersOff();
            }.bind(this);

            this._wd.addEventListener('keyup', tablePlugin._bindOffShift, false);
            this._wd.addEventListener('mousedown', tablePlugin._bindOnSelect, false);
        }

        this._wd.addEventListener('mouseup', tablePlugin._bindOffSelect, false);
        tablePlugin._initBind = tablePlugin.init.bind(this);
        this._wd.addEventListener('touchmove', tablePlugin._initBind, false);
    },

    onClick_tableController: function (e) {
        e.stopPropagation();
        const target = e.target.getAttribute('data-command') ? e.target : e.target.parentNode;
        if (target.getAttribute('disabled')) return;

        const command = target.getAttribute('data-command');
        const value = target.getAttribute('data-value');
        const option = target.getAttribute('data-option');
        const tablePlugin = this.plugins.table;

        if (typeof tablePlugin._closeSplitMenu === 'function') {
            tablePlugin._closeSplitMenu();
            if (command === 'onsplit') return;
        }

        if (typeof tablePlugin._closeAddBorderMenu === 'function') {
            tablePlugin._closeAddBorderMenu();
            if (command === 'onaddborder') return;
        }

        if (typeof tablePlugin._closeRemoveBorderMenu === 'function') {
            tablePlugin._closeRemoveBorderMenu();
            if (command === 'onremoveborder') return;
        }

        if (typeof tablePlugin._closeFillColorMenu === 'function') {
            tablePlugin._closeFillColorMenu();
            if (command === 'onfillcolor') return;
        }

        if (!command) return;

        e.preventDefault();
        const contextTable = this.context.table;

        switch (command) {
            case 'insert':
            case 'delete':
                tablePlugin.editTable.call(this, value, option);
                break;
            case 'header':
                tablePlugin.toggleHeader.call(this);
                break;
            case 'onsplit':
                tablePlugin.openSplitMenu.call(this);
                break;
            case 'split':
                tablePlugin.splitCells.call(this, value);
                break;
            case 'merge':
                tablePlugin.mergeCells.call(this);
                break;
            case 'resize':
                contextTable._maxWidth = !contextTable._maxWidth;
                tablePlugin.setTableStyle.call(this, 'width');
                tablePlugin.setPositionControllerTop.call(this, contextTable._element);
                tablePlugin.setPositionControllerDiv.call(this, contextTable._tdElement, tablePlugin._shift);
                break;
            case 'layout':
                contextTable._fixedColumn = !contextTable._fixedColumn;
                tablePlugin.setTableStyle.call(this, 'column');
                tablePlugin.setPositionControllerTop.call(this, contextTable._element);
                tablePlugin.setPositionControllerDiv.call(this, contextTable._tdElement, tablePlugin._shift);
                break;
            case 'remove':
                const emptyDiv = contextTable._element.parentNode;
                this.util.removeItem(contextTable._element);
                this.controllersOff();

                if (emptyDiv !== this.context.element.wysiwyg) this.util.removeItemAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);
                this.focus();
            case 'fillcolor':
                tablePlugin.fillColor.call(this, value);
                break;
            case 'onaddborder':
                tablePlugin.openAddBorderMenu.call(this);
                break;
            case 'onremoveborder':
                tablePlugin.openRemoveBorderMenu.call(this);
                break;
            case 'onfillcolor':
                tablePlugin.openFillColorMenu.call(this);
                break;
            case 'addborder':
                tablePlugin.addBorder.call(this, value);
                break;
            case 'removeborder':
                tablePlugin.removeBorder.call(this, value);
                break;
        }

        // history stack
        this.history.push(false);
    }
};

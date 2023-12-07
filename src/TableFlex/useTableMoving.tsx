import React, {
  useEffect, useRef,
} from 'react';

const caretOffset = 10;
const minimumResizingWidth = 76;

type UseTableMovingProps = {
  tableRef: React.MutableRefObject<HTMLTableElement | null>
  allowMoving: boolean
};

function useTableMoving(props: UseTableMovingProps) {
  const {
    tableRef,
    allowMoving,
  } = props;
  const mousePosition = useRef(0);
  const movingEl = useRef<HTMLTableCellElement | null>();
  const movingElParent = useRef<HTMLTableRowElement | null>();
  const clientXref = useRef(0);
  const startElementWidth = useRef(0);
  const tableElement = tableRef.current;

  useEffect(() => {
    function resetElements() {
      if (!movingElParent.current) {
        return;
      }

      [...(movingElParent.current?.cells || [])].forEach((cell) => {
        cell.style.cursor = '';
      });
    }

    function onMoveTableCell(e: MouseEvent) {
      e.preventDefault();

      if (!(tableElement && movingEl.current)) {
        return;
      }

      if (clientXref.current === 0) {
        clientXref.current = e.clientX;
        const cellStyle = window.getComputedStyle(movingEl.current);
        const pLeft = parseFloat(cellStyle.getPropertyValue('padding-left')) || 0;
        const pRight = parseFloat(cellStyle.getPropertyValue('padding-right')) || 0;
        startElementWidth.current = movingEl.current.offsetWidth - pLeft - pRight;
        startElementWidth.current = startElementWidth.current >= 0
          ? startElementWidth.current
          : 0;
      }

      const curOffset = clientXref.current - e.clientX;
      const calcWidth = startElementWidth.current - curOffset;

      if (calcWidth >= minimumResizingWidth) {
        const { cellIndex } = movingEl.current;

        cellIndex >= 0 && [...(tableElement.tBodies[0]?.rows || [])].forEach((row) => {
          row.cells[cellIndex].style.width = `${calcWidth}px`;
        });

        movingEl.current.style.width = `${calcWidth}px`;
      }
    }

    function onStopMoving() {
      clientXref.current = 0;
      startElementWidth.current = 0;
      document.removeEventListener('mouseup', onStopMoving);
      movingEl.current = null;
      resetElements();
    }

    function onCursorWatch(e: MouseEvent) {
      const {
        target,
        clientX,
      } = e;
      const htmlTarget = target as HTMLElement;

      if (!(tableElement && movingElParent.current?.contains(htmlTarget))) {
        resetElements();

        return;
      }

      mousePosition.current = clientX;
      const tableCell: HTMLElement | null = htmlTarget.closest('th'); // || htmlTarget.closest('td');

      if (!tableCell) {
        return;
      }

      const {
        left,
        width,
      } = tableCell.getBoundingClientRect();

      const isNearVerticalBorder = clientX < left + caretOffset || clientX > left + width - caretOffset;
      const isFirstOrLastElement = [tableCell.parentElement?.lastElementChild, tableCell.parentElement?.querySelector('th')].includes(tableCell); // tableCell.parentElement?.querySelector('td')

      if (!clientXref.current) {
        if (isFirstOrLastElement) {
          return;
        }

        if (isNearVerticalBorder) {
          tableCell.style.cursor = 'col-resize';
        } else {
          tableCell.style.cursor = '';
        }
      }

      if (movingEl.current) {
        onMoveTableCell(e);
      }
    }

    function onMovingStart(e: MouseEvent) {
      if (!tableElement) {
        return null;
      }

      const getCorrespondingTh = (
        tdElement: HTMLTableCellElement,
      ): HTMLTableCellElement | null => {
        // const tableElement = tdElement.closest('table');

        if (!tableElement) {
          return null;
        }

        const thElements = tableElement.getElementsByTagName('th') || [];

        let thElement = null;

        for (let i = 0; i < thElements.length; i++) {
          const { cellIndex } = thElements[i];

          if (cellIndex === tdElement.cellIndex) {
            thElement = thElements[i];

            break;
          }
        }

        return thElement;
      };

      const { target } = e;
      const htmlTarget = target as HTMLTableCellElement;
      document.addEventListener('mouseup', onStopMoving);
      let tableCell = htmlTarget.closest('th'); // TODO || htmlTarget?.closest('td');

      if (tableCell && tableCell.nodeName === 'TD') {
        tableCell = getCorrespondingTh(tableCell);
      }

      if (!tableCell) {
        return null;
      }

      const elementRect = tableCell.getBoundingClientRect();

      const leftBorderSpacing = mousePosition.current - (elementRect.left || 0);
      const rightBorderSpacing = (elementRect.right || 0) - mousePosition.current;

      const isNearLeftBorder = leftBorderSpacing > -caretOffset
                && leftBorderSpacing < caretOffset;

      const isNearRightBorder = rightBorderSpacing > -caretOffset
                && rightBorderSpacing < caretOffset;

      if (!tableCell) {
        movingEl.current = null;
      }

      if (isNearLeftBorder) {
        const previousSibling = tableCell.previousElementSibling as HTMLTableCellElement;

        if (previousSibling) {
          movingEl.current = previousSibling;
        }
      }

      if (isNearRightBorder) {
        movingEl.current = tableCell;
      }

      return null;
    }

    if (!tableElement) {
      return;
    }

    if (!allowMoving) {
      movingElParent.current = null;
      resetElements();
    }

    if (allowMoving) {
      if (!tableElement.tHead) {
        return;
      }

      movingElParent.current = tableElement.tHead.rows[tableElement.tHead.rows.length - 1];
      document.addEventListener('mousemove', onCursorWatch, true);
      document.addEventListener('mousedown', onMovingStart, true);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      document.removeEventListener('mousedown', onMovingStart, true);
      document.removeEventListener('mousemove', onCursorWatch, true);
    };
  }, [allowMoving, tableElement]);
}

export { useTableMoving };

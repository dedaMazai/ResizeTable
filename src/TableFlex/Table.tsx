/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
import {
    ReactNode, useCallback, useEffect, useRef,
} from 'react';
import { Skeleton, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/classNames/classNames';
import { HStack, VStack } from '@/shared/Stack';

import cls from './Table.module.scss';

export interface Column {
    field: string;
    headerName: string;
    renderCell?: (row: Row) => ReactNode;
    renderHeader?: (name: string) => ReactNode;
    width?: string | number;
}

export interface Cell extends Record<string, string | number | boolean | any> {
    value: string | number;
    isImg: boolean;
    render?: (col: Column, row: Row) => ReactNode;
}

export interface Row
    extends Record<string, string | number | boolean | any | Cell> {
    id: number | string;
    height?: string | number;
}

interface TableProps {
    className?: string;
    columns?: Column[];
    rows?: Row[];
    isLoading?: boolean;
    hideHeader?: boolean;
    noData?: string | ReactNode;
    onSelectCell?: (col: string, row: string) => void;
    onChangeWidthCol?: (col: string, width: number) => void;
    onChangeHeightRow?: (height: string, row: number) => void;
    onChangeActiveCell?: (value: string) => void;
    activeCell?: { col: string; row: string };
}

const caretOffset = 7;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 30;

export const Table = (props: TableProps) => {
    const {
        className,
        columns,
        rows,
        isLoading,
        noData,
        onSelectCell,
        hideHeader,
        activeCell,
        onChangeActiveCell,
        onChangeWidthCol,
        onChangeHeightRow,
    } = props;
    const clientXref = useRef(0);
    const startMovingWidthRef = useRef(0);
    const mousePositionX = useRef(0);

    const clientYref = useRef(0);
    const startMovingHeightRef = useRef(0);
    const mousePositionY = useRef(0);

    const movingEl = useRef<HTMLDivElement | null>();
    const ref = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    const changeActiveCell = useCallback(
        (e: MouseEvent) => {
            const htmlTarget = e.target as HTMLDivElement;
            const data = (htmlTarget.closest('#tableCell') as HTMLDivElement)?.dataset;

            if (data.col && data.row) {
                onSelectCell?.(data.col, data.row);
            }
        },
        [onSelectCell],
    );

    useEffect(() => {
        const block = ref.current;
        if (!block) {
            return undefined;
        }
        block.addEventListener('dblclick', changeActiveCell);

        return () => {
            block.removeEventListener('dblclick', changeActiveCell);
        };
    }, [changeActiveCell]);

    function onMovingStart(e: MouseEvent) {
        const { target } = e;
        const htmlTarget = target as HTMLDivElement;
        let tableCell = htmlTarget.closest('#tableCell') as HTMLDivElement;

        if (!tableCell) {
            return;
        }

        const elementRect = tableCell?.getBoundingClientRect();

        const leftSpaceToBorder = mousePositionX.current - (elementRect?.left || 0);
        const rightSpaceToBorder = (elementRect?.right || 0) - mousePositionX.current;

        const isNearLeftBorder = leftSpaceToBorder < caretOffset;
        const isNearRightBorder = rightSpaceToBorder < caretOffset;

        if (isNearLeftBorder) {
            const previousSibling = tableCell.previousElementSibling as HTMLDivElement;

            if (previousSibling) {
                movingEl.current = previousSibling;
                clientXref.current = e.clientX;
                startMovingWidthRef.current = previousSibling.offsetWidth;
            }
        }

        if (isNearRightBorder) {
            movingEl.current = tableCell;
            clientXref.current = e.clientX;
            startMovingWidthRef.current = tableCell.offsetWidth;
        }
    }

    function changeWidth(e: MouseEvent) {
        const {
            target,
            clientX,
        } = e;

        mousePositionX.current = clientX;
        const htmlTarget = target as HTMLElement;
        const tableCell: HTMLElement | null = htmlTarget.closest('#tableCell');

        if (!tableCell) {
            return;
        }

        const {
            left,
            right,
        } = tableCell.getBoundingClientRect();

        const leftSpaceToBorder = clientX - left;
        const rightSpaceToBorder = right - clientX;

        const isNearLeftBorder = leftSpaceToBorder < caretOffset;
        const isNearRightBorder = rightSpaceToBorder < caretOffset;

        const isNearVerticalBorder = isNearLeftBorder || isNearRightBorder;

        if (isNearRightBorder && tableCell.parentElement?.lastElementChild === tableCell) {
            return;
        } else if (isNearLeftBorder && tableCell.parentElement?.querySelector('#tableCell') === tableCell) {
            return;
        } else if (isNearVerticalBorder) {
            tableCell.style.cursor = 'col-resize';
            tableCell.style.userSelect = 'none';
        } else {
            tableCell.style.cursor = '';
            tableCell.style.userSelect = 'auto';
        }

        if (movingEl.current) {
            const offset = e.clientX - clientXref.current;
            const calcWidth = startMovingWidthRef.current + offset;
            if (movingEl.current.dataset?.col) {
                onChangeWidthCol?.(movingEl.current.dataset.col, calcWidth > MIN_WIDTH ? calcWidth : MIN_WIDTH)
            }
        }
    }

    function changeHeight(e: MouseEvent) {
        const {
            target,
            clientY,
            clientX,
        } = e;

        mousePositionY.current = clientY;
        const htmlTarget = target as HTMLElement;
        const tableRow: HTMLElement | null = htmlTarget.closest('#tableRow');

        if (!tableRow) {
            return;
        }

        const {
            bottom,
            top,
        } = tableRow.getBoundingClientRect();

        const topSpaceToBorder = clientY - top;
        const bottomSpaceToBorder = bottom - clientY;

        const isNearTopBorder = topSpaceToBorder < caretOffset;
        const isNearBottomBorder = bottomSpaceToBorder < caretOffset;

        const isNearHorizontalBorder = isNearTopBorder || isNearBottomBorder;

        let isNearVerticalBorder = false;
        const tableCell: HTMLElement | null = htmlTarget.closest('#tableCell');
        if (tableCell) {
            const {
                left,
                right,
            } = tableCell.getBoundingClientRect();

            const leftSpaceToBorder = clientX - left;
            const rightSpaceToBorder = right - clientX;

            const isNearLeftBorder = leftSpaceToBorder < caretOffset;
            const isNearRightBorder = rightSpaceToBorder < caretOffset;

            isNearVerticalBorder = isNearLeftBorder || isNearRightBorder;
        }

        if (isNearBottomBorder && tableRow.parentElement?.lastElementChild === tableRow) {
            return;
        } else if (isNearTopBorder && tableRow.parentElement?.querySelector('#tableRow') === tableRow) {
            return;
        } else if (isNearHorizontalBorder && !isNearVerticalBorder) {
            tableRow.style.cursor = 'row-resize';
            tableRow.style.userSelect = 'none';

            if (tableCell) {
                tableCell.style.cursor = 'row-resize';
                tableCell.style.userSelect = 'none';
            }
        } else {
            tableRow.style.cursor = '';
            tableRow.style.userSelect = 'auto';
        }

        // if (movingEl.current) {
        //     const offset = e.clientX - clientXref.current;
        //     const calcWidth = startMovingWidthRef.current + offset;
        //     if (movingEl.current.dataset?.col) {
        //         onChangeWidthCol?.(movingEl.current.dataset.col, calcWidth > MIN_WIDTH ? calcWidth : MIN_WIDTH)
        //     }
        // }
    }

    function onCursorWatch(e: MouseEvent) {
        changeWidth(e);
        changeHeight(e);
    }

    function onStopMoving() {
      clientXref.current = 0;
      startMovingWidthRef.current = MIN_WIDTH;
      movingEl.current = null;
    }

    useEffect(() => {
        document.addEventListener('mousemove', onCursorWatch);
        document.addEventListener('mousedown', onMovingStart);
        document.addEventListener('mouseup', onStopMoving);

        return () => {
            document.removeEventListener('mousemove', onCursorWatch);
            document.removeEventListener('mousedown', onMovingStart);
            document.removeEventListener('mouseup', onStopMoving);
        };
    }, []);

    if (isLoading) {
        return (
            <div className={cls.skeleton}>
                <Skeleton />
            </div>
        );
    }

    return (
        <VStack gap="8" className={classNames(cls.tableWrapper, [className])}>
            <div className={classNames(cls.table)} ref={ref}>
                {!hideHeader && (
                    <div
                        className={classNames(cls.rowHeader)}
                    >
                        {columns?.map((el, index) => (
                            <div
                                id="tableCell"
                                key={index}
                                className={classNames(cls.cellHeader, {
                                    [cls.lastHeaderCell]: index + 1 === columns.length,
                                })}
                                style={{
                                    width: el.width || MIN_WIDTH,
                                }}
                            >
                                {el.renderHeader
                                    ? el.renderHeader(el.headerName)
                                    : el.headerName}
                            </div>
                        ))}
                    </div>
                )}
                {!!rows?.length && rows.map((row, rowIndex) => (
                    <div
                        id="tableRow"
                        key={row.id}
                        className={classNames(cls.row, {
                            [cls.rowLast]: rowIndex + 1 === rows.length,
                        })}
                        style={{
                            height: row.height || MIN_HEIGHT,
                        }}
                    >
                        {columns?.map((col, colIndex) => (
                            <div
                                id="tableCell"
                                key={colIndex}
                                className={classNames(cls.cell, {
                                    [cls.lastCell]: colIndex + 1 === columns.length,
                                })}
                                data-row={rowIndex}
                                data-col={colIndex}
                                style={{
                                    width: col.width || MIN_WIDTH,
                                    height: row.height || MIN_HEIGHT,
                                }}
                            >
                                {
                                    (activeCell?.col && +activeCell.col === colIndex)
                                    && (activeCell?.row && +activeCell.row === rowIndex)
                                    && !row[col.field]?.isImg
                                    && onChangeActiveCell
                                        ? (
                                            <input
                                                className={cls.inputCell}
                                                value={typeof row[col.field] === 'object' ? row[col.field]?.value : row[col.field]}
                                                onChange={(e) => onChangeActiveCell?.(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            row[col.field]?.render
                                                ? row[col.field].render(
                                                        col,
                                                        row,
                                                    )
                                                : typeof row[col.field] === 'object'
                                                    ? row[col.field]?.value
                                                    : row[col.field]
                                        )
                                }
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {!rows?.length && (
                <HStack className={cls.empty} max justify="center">
                    {noData && (typeof noData === 'string' ? (<Typography.Text>{noData}</Typography.Text>) : (noData))}
                    {!noData && (
                        <Typography.Text>{t('Нет данных')}</Typography.Text>
                    )}
                </HStack>
            )}
        </VStack>
    );
};

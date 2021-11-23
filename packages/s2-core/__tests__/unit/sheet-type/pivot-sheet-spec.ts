import { getContainer } from 'tests/util/helpers';
import * as dataCfg from 'tests/data/simple-data.json';
import { Canvas, Event as GEvent } from '@antv/g-canvas';
import { PivotSheet } from '@/sheet-type';
import {
  CustomSVGIcon,
  getIcon,
  InterceptType,
  KEY_GROUP_PANEL_SCROLL,
  RowCellCollapseTreeRowsType,
  S2DataConfig,
  S2Event,
  S2Options,
  TOOLTIP_CONTAINER_CLS,
} from '@/common';
import { Node } from '@/facet/layout/node';
import { getSafetyDataConfig } from '@/utils';

jest.mock('@/interaction/event-controller');
jest.mock('@/interaction/root');

describe('PivotSheet Tests', () => {
  let s2: PivotSheet;

  const customSVGIcon: CustomSVGIcon = {
    name: 'test',
    svg: '===',
  };

  const s2Options: S2Options = {
    width: 300,
    height: 200,
    hierarchyType: 'grid',
    customSVGIcons: [customSVGIcon],
  };

  const container = getContainer();

  beforeAll(() => {
    s2 = new PivotSheet(container, dataCfg, s2Options);
    s2.render();
  });

  describe('PivotSheet Tooltip Tests', () => {
    test('should init tooltip', () => {
      s2.showTooltip({ position: { x: 0, y: 0 } });

      expect(s2.tooltip.container.className).toEqual(
        `${TOOLTIP_CONTAINER_CLS} ${TOOLTIP_CONTAINER_CLS}-show`,
      );
    });

    test('should destroy tooltip', () => {
      const destroyTooltipSpy = jest
        .spyOn(s2.tooltip, 'destroy')
        .mockImplementation(() => {});

      s2.destroy();

      expect(destroyTooltipSpy).toHaveBeenCalledTimes(1);
    });

    test('should show tooltip when call showTooltip', () => {
      const showTooltipSpy = jest
        .spyOn(s2.tooltip, 'show')
        .mockImplementation(() => {});

      s2.showTooltip({ position: { x: 0, y: 0 } });

      expect(showTooltipSpy).toHaveBeenCalledTimes(1);
    });

    test("should dont't show tooltip when call showTooltipWithInfo if enable tooltip", () => {
      const showTooltipSpy = jest
        .spyOn(s2.tooltip, 'show')
        .mockImplementation(() => {});

      s2.showTooltipWithInfo({} as GEvent, []);

      expect(showTooltipSpy).not.toHaveBeenCalled();
    });

    test('should show tooltip when call showTooltipWithInfo if enable tooltip', () => {
      Object.defineProperty(s2.options, 'tooltip', {
        value: {
          showTooltip: true,
        },
        configurable: true,
      });

      const showTooltipSpy = jest
        .spyOn(s2.tooltip, 'show')
        .mockImplementation(() => {});

      s2.showTooltipWithInfo({} as GEvent, []);

      expect(showTooltipSpy).toHaveBeenCalledTimes(1);
    });

    test('should hide tooltip', () => {
      const hideTooltipSpy = jest
        .spyOn(s2.tooltip, 'hide')
        .mockImplementation(() => {});

      s2.hideTooltip();

      expect(hideTooltipSpy).toHaveBeenCalledTimes(1);
    });
  });

  test('should register icons', () => {
    s2.registerIcons();

    expect(getIcon(customSVGIcon.name)).toEqual(customSVGIcon.svg);
  });

  test('should set data config', () => {
    const newDataCfg: S2DataConfig = {
      fields: {
        rows: ['field'],
      },
      data: [],
    };
    s2.setDataCfg(newDataCfg);

    // save original data cfg
    expect(s2.store.get('originalDataCfg')).toEqual(newDataCfg);
    // update data cfg
    expect(s2.dataCfg).toEqual(getSafetyDataConfig(newDataCfg));
  });

  test('should set options', () => {
    const hideTooltipSpy = jest
      .spyOn(s2.tooltip, 'hide')
      .mockImplementation(() => {});

    const options: Partial<S2Options> = {
      showSeriesNumber: true,
    };

    s2.setOptions(options);

    // should hide tooltip if options updated
    expect(hideTooltipSpy).toHaveBeenCalledTimes(1);
    expect(s2.options.showSeriesNumber).toBeTruthy();
  });

  test('should render sheet', () => {
    const facetRenderSpy = jest
      .spyOn(s2, 'buildFacet' as any)
      .mockImplementation(() => {});

    const beforeRender = jest.fn();
    const afterRender = jest.fn();

    s2.on(S2Event.LAYOUT_BEFORE_RENDER, beforeRender);
    s2.on(S2Event.LAYOUT_AFTER_RENDER, afterRender);

    s2.render(false);

    // build facet
    expect(facetRenderSpy).toHaveBeenCalledTimes(1);
    // emit hooks
    expect(beforeRender).toHaveBeenCalledTimes(1);
    expect(afterRender).toHaveBeenCalledTimes(1);
  });

  test('should updatePagination', () => {
    s2.updatePagination({
      current: 2,
      pageSize: 5,
    });

    expect(s2.options.pagination).toEqual({
      current: 2,
      pageSize: 5,
    });
    // reset scroll bar offset
    expect(s2.store.get('scrollX')).toEqual(0);
    expect(s2.store.get('scrollY')).toEqual(0);
  });

  test('should get content height', () => {
    expect(s2.getContentHeight()).toEqual(120);
  });

  test('should get layout width type', () => {
    expect(s2.getLayoutWidthType()).toEqual('adaptive');
  });

  test('should get row nodes', () => {
    expect(s2.getRowNodes()).toHaveLength(3);
  });

  test('should get column nodes', () => {
    expect(s2.getColumnNodes()).toHaveLength(3);
  });

  test('should change sheet size', () => {
    s2.changeSize(1000, 500);

    expect(s2.options.width).toEqual(1000);
    expect(s2.options.height).toEqual(500);

    const canvas = s2.container.get('el') as HTMLCanvasElement;

    expect(canvas.style.width).toEqual(`1000px`);
    expect(canvas.style.height).toEqual(`500px`);
  });

  test('should set display:block style with canvas', () => {
    const canvas = s2.container.get('el') as HTMLCanvasElement;

    expect(canvas.style.display).toEqual('block');
  });

  test('should update scroll offset', () => {
    const updateScrollOffsetSpy = jest
      .spyOn(s2.facet, 'updateScrollOffset')
      .mockImplementation(() => {});

    s2.updateScrollOffset({});

    expect(updateScrollOffsetSpy).toHaveReturnedTimes(1);
  });

  test('should init canvas groups', () => {
    expect(s2.container).toBeInstanceOf(Canvas);
    expect(s2.container.get('width')).toEqual(s2.options.width);
    expect(s2.container.get('height')).toEqual(s2.options.height);

    // sheet group
    expect(s2.backgroundGroup.getChildren()).toEqual([]);
    expect(s2.foregroundGroup.getChildren()).toEqual([]);

    // panel scroll group
    expect(s2.panelGroup.getChildren()).toHaveLength(1);
    expect(s2.panelGroup.findAllByName(KEY_GROUP_PANEL_SCROLL)).toHaveLength(1);
  });

  test('should get empty init column nodes', () => {
    // don't save column nodes for pivot table
    expect(s2.getInitColumnNodes()).toHaveLength(0);
  });

  test('should get pivot mode', () => {
    expect(s2.isPivotMode()).toBeTruthy();
    expect(s2.isTableMode()).toBeFalsy();
  });

  test('should get hierarchy type', () => {
    expect(s2.isHierarchyTreeType()).toBeFalsy();
  });

  test('should default frozen row header', () => {
    expect(s2.isFrozenRowHeader()).toBeTruthy();
    expect(s2.isScrollContainsRowHeader()).toBeFalsy();
  });

  test('should get value is in columns', () => {
    expect(s2.isValueInCols()).toBeTruthy();
  });

  test('should clear drill down data', () => {
    const renderSpy = jest.spyOn(s2, 'render').mockImplementation(() => {});

    s2.interaction.addIntercepts([InterceptType.BRUSH_SELECTION]);

    const clearDrillDownDataSpy = jest
      .spyOn(s2.dataSet, 'clearDrillDownData' as any)
      .mockImplementation(() => {});

    s2.clearDrillDownData();

    expect(clearDrillDownDataSpy).toHaveBeenCalledTimes(1);

    // rerender
    expect(renderSpy).toHaveBeenCalledTimes(1);
    // reset interaction
    expect(
      s2.interaction.hasIntercepts([InterceptType.BRUSH_SELECTION]),
    ).toBeFalsy();
  });

  test('should collapse rows with tree mode', () => {
    const renderSpy = jest.spyOn(s2, 'render').mockImplementation(() => {});

    const collapseRows = jest.fn();
    const afterCollapseRows = jest.fn();

    s2.on(S2Event.LAYOUT_COLLAPSE_ROWS, collapseRows);
    s2.on(S2Event.LAYOUT_AFTER_COLLAPSE_ROWS, afterCollapseRows);

    const treeRowType: RowCellCollapseTreeRowsType = {
      id: 'testId',
      isCollapsed: false,
      node: null,
    };

    const collapsedRows = {
      [treeRowType.id]: treeRowType.isCollapsed,
    };

    s2.emit(S2Event.ROW_CELL_COLLAPSE_TREE_ROWS, treeRowType);

    expect(collapseRows).toHaveBeenCalledWith({
      collapsedRows,
    });
    expect(afterCollapseRows).toHaveBeenCalledWith({
      collapsedRows,
    });
    expect(s2.options.style.collapsedRows).toEqual(collapsedRows);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  test('should collapse all rows with tree mode', () => {
    s2.setOptions({ style: { collapsedRows: null } });

    const renderSpy = jest.spyOn(s2, 'render').mockImplementation(() => {});

    const isCollapsed = true;

    s2.emit(S2Event.LAYOUT_TREE_ROWS_COLLAPSE_ALL, isCollapsed);

    expect(s2.options.style.collapsedRows).toEqual({});
    expect(s2.options.hierarchyCollapse).toBeFalsy();
    expect(renderSpy).toHaveBeenCalledTimes(1);

    s2.emit(S2Event.LAYOUT_TREE_ROWS_COLLAPSE_ALL, !isCollapsed);

    expect(s2.options.style.collapsedRows).toEqual({});
    expect(s2.options.hierarchyCollapse).toBeTruthy();
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  test('should handle group sort', () => {
    const renderSpy = jest.spyOn(s2, 'render').mockImplementation(() => {});

    const showTooltipWithInfoSpy = jest
      .spyOn(s2, 'showTooltipWithInfo')
      .mockImplementation(() => {});

    const nodeMeta = new Node({ id: '1', key: '1', value: 'testValue' });

    s2.handleGroupSort(
      {
        stopPropagation() {},
      } as GEvent,
      nodeMeta,
    );

    expect(showTooltipWithInfoSpy).toHaveBeenCalledTimes(1);

    s2.groupSortByMethod('asc', nodeMeta);

    expect(s2.dataCfg.sortParams).toEqual([
      {
        query: undefined,
        sortByMeasure: nodeMeta.value,
        sortFieldId: 'field',
        sortMethod: 'asc',
      },
    ]);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    s2.groupSortByMethod('desc', nodeMeta);

    expect(s2.dataCfg.sortParams).toEqual([
      {
        query: undefined,
        sortByMeasure: nodeMeta.value,
        sortFieldId: 'field',
        sortMethod: 'desc',
      },
    ]);
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
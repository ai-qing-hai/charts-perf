import _ from 'lodash';
import React, { useState } from 'react';
import { Result } from './result';
import { Config, IConfig } from './config';
import { StopButton } from './stopButton';
import { run } from '../../perf/runner';
import { useType } from '../../helper';
import { ENGINES } from '../../common/const';
import { PerfData, DataAttributeType, OneDataType } from '../../types';

import './index.less';

export const Content = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<IConfig>({
    engines: ENGINES,
    types: ['Line', 'Bar', 'Area', 'Scatter'],
  });
  const [perfData, setPerfData] = useState<PerfData>({});

  const [dataAttribute, setDataAttribute] = useState<DataAttributeType>([
    { value: 'start', num: 200, label: 'Start' },
    { value: 'end', num: 10000, label: 'End' },
    { value: 'step', num: 200, label: 'Step' },
  ]); // 数据属性

  function onConfigChange(cfg: IConfig) {
    if (loading) return;
    setConfig(cfg);
  }

  async function onOk() {
    if (loading) {
      return;
    }
    setLoading(true);

    setTimeout(async () => {
      const { engines, types } = config;
      const perfData = await run(engines, types, dataAttribute);

      setPerfData(perfData);
      setLoading(false);
    });
  }

  function onInputNumberChange(newValue: OneDataType, index: number) {
    const newDataAttribute = [...dataAttribute];
    if (_.isString(newValue.num)) {
      // @ts-ignore
      _.set(newValue, 'num', Number(newValue.num.replace(/[^0-9]/g, '')));
    }

    if (newValue.num < 200) {
      newValue.num = 200;
    }

    if (index === 0) {
      if (newValue.num > newDataAttribute[1].num) {
        newValue.num = newDataAttribute[1].num;
      }
    } else if (index === 1) {
      if (newValue.num < newDataAttribute[0].num) {
        newValue.num = newDataAttribute[0].num;
      }
    }

    _.set(newDataAttribute, index, newValue);

    setDataAttribute(newDataAttribute);
  }

  return (
    <div className="content">
      <div className="contentMain">
        <Config
          loading={loading}
          types={config.types}
          engines={config.engines}
          inputNumberData={dataAttribute}
          onOk={onOk}
          useType={useType}
          onChange={onConfigChange}
          onInputNumberChange={onInputNumberChange}
        />
        <div className="contentResults">
          <Result loading={loading} config={config} perfData={perfData} />
        </div>
        {loading && (
          <div>
            <div
              id="modalBody"
              className={useType === 'pc' ? "modalBody" : "modalBody modalBodyMobile"}
              style={useType === 'pc' ? { width: 900, height: 600 } : { width: '100%', height: '100%', borderRadius: 0, paddingTop: 20 }}
            >
              <div className="modalMessageControl">
                <div className="stopRender">
                  <StopButton size={ useType === 'pc' ? 'small' : 'middle' } />
                </div>
                <div className="breadCrumb" style={{ height: useType === 'pc' ? 16 : 30 }}>
                  <div className="accounted" style={{ textIndent: useType === 'pc' ? 50 : 20 }} />
                  <div className="progress" />
                  <div className="progressBackground" />
                </div>
              </div>
              {/* 渲染用dom */}
              <div id="renderDom" className="renderDom" />
            </div>
            <div className="maskDiv" />
          </div>
        )}
      </div>
    </div>
  );
};

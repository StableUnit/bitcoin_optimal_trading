import React, { Component } from 'react';
import cc from 'cryptocompare';
import './App.css';
import AmCharts from '@amcharts/amcharts3-react';

class App extends Component {
  state = { data: [],
            convertedData: [],
            originalBalance: 1,
            numberOfTraders: 0,
            maxProfit: 1,
            log: []
          };
  async componentDidMount() {
    const data = await cc.histoHour('BTC', 'USDT', { e: 'Binance' });
    const convertedData = data.map(entry => ({
      ...entry,
      time: new Date(entry.time * 1000)
    }));
    this.setState({ data, convertedData });
  }




  /**
 * @param {number[]} prices
 * @return {number}
 */
  maxProfit(convertedData) {
    let prices = [];
    for (let key in convertedData) {
      prices.push( (convertedData[key].high + convertedData[key].low)/2 );
    }

    const n = prices.length;
    let deep_i = 0;
    let portfolio = this.state.originalBalance;
    let log = [];

    for (let i = 1; i <= n; i++) {
        let buy_price = convertedData[deep_i].low;
        let sell_price = convertedData[i-1].high;
        if (i === n || sell_price >= convertedData[i].high) {
            if (deep_i < i-1) {
                //buy fucking deeps
                let profit = (sell_price - buy_price) / buy_price;
                portfolio *= 1+profit;
                log.push("Buying dip "  + "at " + buy_price + "$ " + "on " + convertedData[deep_i].time.toLocaleString());
                log.push("Selling peak " + "at " + sell_price+ "$ " + "on " + convertedData[i-1].time.toLocaleString());
                log.push("Making x" + (profit*100).toFixed(2) + "%");
            }
            // new deep
            deep_i = i;
        }
    }
    return [portfolio, log];
  };

  handleSubmit = () => {
    console.log("button was pressed!");
    let [maxProfit,log] = this.maxProfit(this.state.convertedData);
    this.setState({maxProfit: maxProfit, log: log });
  }

  handleBalanceChange(event) {
    this.setState({originalBalance: event.target.value});
  }

  handleTradesChange(event) {
    this.setState({numberOfTraders: event.target.value});
  }

  render() {
    //const { data } = this.state;

    const {convertedData} = this.state;

    const options = {
      type: 'serial',
      categoryField: 'time',
      autoMarginOffset: 40,
      marginRight: 60,
      marginTop: 60,
      fontSize: 13,
      theme: 'light',
      categoryAxis: {
        parseDates: true,
        minPeriod: 'hh'
      },
      chartCursor: {
        enabled: true
      },
      chartScrollbar: {
        enabled: true,
        graph: 'g1',
        graphType: 'line',
        scrollbarHeight: 30
      },
      trendLines: [],
      graphs: [
        {
          balloonText:
            'Open:<b>[[open]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>',
          closeField: 'close',
          fillAlphas: 0.9,
          fillColors: '#7f8da9',
          highField: 'high',
          id: 'g1',
          lineColor: '#7f8da9',
          lowField: 'low',
          negativeFillColors: '#db4c3c',
          negativeLineColor: '#db4c3c',
          openField: 'open',
          title: 'Price:',
          type: 'candlestick',
          valueField: 'close',
          valueAxis: 'candles'
        }
      ],
      guides: [
        {
          id: 'Guide-1'
        },
        {
          id: 'Guide-2'
        }
      ],
      valueAxes: [
        {
          id: 'candles'
        }
      ],
      allLabels: [],
      balloon: {},
      titles: [],
      dataProvider: convertedData
    };

    return (
      <div  align="center">
        <h1> Learn about how much money could you make if you were trading optimaly</h1>

        <AmCharts.React style={{ width: '100%', height: '600px' }} options={options} />


          <label>
            How much BTC did you have:
            <input type="text" value={this.state.originalBalance} onChange={(e) => this.handleBalanceChange(e)} />
          </label>
          <br/>
          <label>
            How many fucking dips were you buying
            <input type="text" value={this.state.numberOfTraders} onChange={(e) => this.handleTradesChange(e)} />
          </label>
          <br/>
          <button onClick={this.handleSubmit}> Tell me how much I would have earned if I was buying the fucking dips </button>
          <p> If you were buying optimaly {this.state.log.length/2} fucking dips, you could have {this.state.maxProfit} BTC</p>
          <ul>
            {this.state.log.map((log,i) => <li key={i}>{log}</li>)}
          </ul>

      </div>
    );
  }
}

export default App;

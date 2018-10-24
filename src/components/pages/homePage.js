import React, { Component } from 'react';
import axios from 'axios';
import {formatUpTime,convertHashRate} from '../lib/utils'
import { withRouter, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import {getStorage,setStorage,deleteStorage,generateUrlEncoded} from '../lib/utils'
import {Line} from 'react-chartjs-2';

class Homepage extends Component {

  constructor(props) {
    super(props);
    var params = queryString.parse(this.props.location.search);
    var isRestarting=false;
    var isRebooting=false;
    if (params!=null&typeof params["restarting"] !== 'undefined') {
      isRestarting=true;
    }
    if (params!=null&typeof params["rebooting"] !== 'undefined') {
      isRebooting=true;
    }
    this.state = {
      "pools": [],
      "chains": [],
      "summary": [],
      "isLoaded": false,
      "isRestarting": isRestarting,
      "isRebooting": isRebooting,
      "redirectToLogin":false,
      "hashRatesDataSets": [],
      "hashRatesTimes": [],
      "showGraph": false,
      "isTuning": false
    };

  }


  componentDidMount() {
    this.loadInfo();
    this.loadHashRates();
  }

  componentWillUnmount() {
    if (typeof this.timeOutReload !== 'undefined')
      clearTimeout(this.timeOutReload);
    if (typeof this.timeOutLoad !== 'undefined')
      clearTimeout(this.timeOutLoad);
    if (typeof this.timeOutHashRates !== 'undefined')
      clearTimeout(this.timeOutHashRates);
  }

  loadHashRates() {
    var colors=["#03a9f3","#20c997","#bc2929","#6c757d","#ab8ce4","#01c0c8","#fec107","#6610f2"];
    var token=getStorage("jwt");
    if (token===null) {
      this.setState({"redirectToLogin":true});
    } else {
      var page=this;
      var postData = {

      };
      let axiosConfig = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
      };
      axios.post(window.customVars.urlPrefix+window.customVars.apiHashRates,postData,axiosConfig)

      .then(res => {

        if (res.data.success==true) {

          var dataSets=[];
          var hashRatesTotal=[];
          var times=[];
          var showGraph=false;

          if (res.data.stats) {
            Object.keys(res.data.stats).forEach(function(key) {
              var chain=res.data.stats[key];
              var dataSet={
                  label: 'Chain '+(parseInt(key)+1),
                  data: chain,
                  fill: false,
                  borderWidth: 2,
                  borderColor: colors[key],
                  pointHoverBackgroundColor: colors[key],
                  pointHoverBorderColor: colors[key]
              };
              dataSets.push(dataSet);


              if (chain!=null) {
                if (chain.length>1)
                  showGraph=true;
                for(var j=0;j<chain.length;j++) {
                  if ( hashRatesTotal[j] !== void 0 ) {
                    hashRatesTotal[j]+=chain[j];
                  } else {
                    hashRatesTotal[j]=chain[j];
                  }
                }
              }

            });
            var dataSetTotal={
                label: 'Total',
                data: hashRatesTotal,
                fill: false,
                borderColor: "#f57e22",
                pointHoverBackgroundColor: "#f57e22",
                pointHoverBorderColor: "#f57e22"
            };
            dataSets.push(dataSetTotal);

          }
          if (res.data.times) {
            res.data.times.forEach(function(time)  {
              var date=new Date(time*1000);
              date.setSeconds(0,0);
              times.push(date);
            });

          }
         page.setState({"hashRatesDataSets":dataSets,"hashRatesTimes":times,"showGraph":showGraph});


          page.timeOutHashRates=setTimeout(() => {
            page.loadHashRates();
          }, 30000);

        } else if (res.data.success==false) {

          if ((typeof res.data.token !== 'undefined')&&res.data.token!==null&&res.data.token==="expired") {
              deleteStorage("jwt");
              page.setState({"redirectToLogin":true});
          } else {
            page.timeOutHashRates=setTimeout(() => {
              page.loadHashRates();
            }, 30000);
          }

        }
      })
      .catch(function (error) {
        page.timeOutHashRates=setTimeout(() => {
          page.loadHashRates();
        }, 30000);
      });
    }
  }

  loadInfo() {
    var token=getStorage("jwt");
    if (token===null) {
      this.setState({"redirectToLogin":true});
    } else {
      var accepted=0,rejected=0,hwErrors=0,mHs=0,upTime=0,fansSpeed=0;
      var page=this;
      var postData = {

      };
      let axiosConfig = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
      };
      axios.post(window.customVars.urlPrefix+window.customVars.apiDevsPools,postData,axiosConfig)

      .then(res => {

        if (res.data.success==true) {
          const chains = res.data.DEVS;

          upTime=chains[0]['Device Elapsed']*1000;
          if ("HARDWARE" in res.data && "Fan duty" in res.data.HARDWARE && parseInt(res.data.HARDWARE["Fan duty"])>0) {
            fansSpeed=res.data.HARDWARE["Fan duty"];
          }
          chains.forEach(function(chain)  {
            if ("DUTY" in chain&&parseInt(chain['DUTY'])>0) {
              fansSpeed=chain['DUTY'];
            }
            accepted+=parseInt(chain["Accepted"]);
            rejected+=parseInt(chain["Rejected"]);
            hwErrors+=parseInt(chain["Hardware Errors"]);
            mHs+=parseFloat(chain["Hash Rate"]);
          });
          const summary = {"accepted":accepted,"rejected": rejected, "hwErrors":hwErrors, "mHs":mHs, "upTime":upTime, "fansSpeed":fansSpeed}
          const pools = res.data.POOLS;
          this.setState({
            pools: pools,
            chains: chains,
            summary: summary,
            isLoaded: true,
            isRestarting: false,
            isRebooting:false,
            isTuning: res.data.tuning
          });

          page.timeOutReload=setTimeout(() => {
            page.loadInfo();
          }, 30000);

        } else if (res.data.success==false) {

          if ((typeof res.data.token !== 'undefined')&&res.data.token!==null&&res.data.token==="expired") {
              deleteStorage("jwt");
              page.setState({"redirectToLogin":true});
          } else {
            page.timeOutLoad=setTimeout(() => {
              page.loadInfo();
            }, 10000);

          }

        }
      })
      .catch(function (error) {
        page.timeOutLoad=setTimeout(() => {
          page.loadInfo();
        }, 10000);
      });
    }

  }


  render() {
    const { pools, chains, summary, isLoaded, isRestarting, isRebooting, redirectToLogin,hashRatesDataSets,hashRatesTimes,showGraph,isTuning } = this.state;

    if (redirectToLogin) {
      return <Redirect to="/login?expired" />;
    }

    var hashRatesData={
        labels: hashRatesTimes,
        datasets: hashRatesDataSets
    };



    var options={
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
                return " "+convertHashRate(tooltipItem.yLabel);
            }
        }
      },
      maintainAspectRatio: false,
      elements: {
          point: {
              radius: 0,
              hitRadius: 5,
              hoverRadius: 5
          }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: "hour"
          }
        }],
        yAxes: [
            {
                ticks: {
                    callback: function(label, index, labels) {
                        return convertHashRate(label);
                    }
                }
            }
        ]
      }

    };


    var acceptedRate=0;
    var loadAcceptedRejected=(typeof summary.accepted !== 'undefined');
    if (loadAcceptedRejected) {
      var tempAcceptedRate=(summary.accepted/(summary.rejected+summary.accepted)*100).toFixed(1);
      acceptedRate=(tempAcceptedRate==100?100:tempAcceptedRate);

    }

    return (
      <div className="Homepage">

      <h1>Miner Status<br/><small>Live Data (auto-refresh)</small></h1>


      {isRestarting &&
      <div className="alert alert-info mt-5">
        Please wait until the miner reload the new configuration.
      </div>
      }
      {isRebooting &&
      <div className="alert alert-info mt-5">
        The miner is rebooting, please wait
      </div>
      }

      {/* Box Summary */}
      <div className="row mt-5">
         <div className="col-md-12">
              {isTuning &&
              <div className="row">
                <div className="col-md-12">
                  <div className="alert alert-warning">
                    <div className="ml-2 lds-dual-ring small pt-1"></div> Please note the miner is autotuning, hashrate may vary until completion!
                  </div>
                </div>
              </div>
              }
              <div className="row">

               <div className="col-lg-5 col-md-12 dashboard-cards">
                  <div className="row">
                      <div className="col-md-6 col-sm-6">
                        {/* card uptime */ }
                        <div className="m-2 card orange">
                          <div className="card-body">
                            {!summary.upTime && <div className="lds-dual-ring"></div>}
                            {summary.upTime && <p className="card-text">{formatUpTime(summary.upTime)}</p>}
                          </div>
                          <div className="card-footer">
                             <h5 className="card-title"> <i className="fa fa-clock"></i> up time</h5>
                          </div>
                        </div>{/* .card uptime */ }
                      </div>
                      <div className="col-md-6 col-sm-6">
                      {/* card Accepted */ }
                      <div className="m-2 card green">
                        <div className="card-body">
                          {loadAcceptedRejected==true &&
                              <p className="card-text">
                              {acceptedRate}%
                              <span className="ml-1 small">({summary.accepted}/{summary.rejected})</span>
                              </p>
                          }

                          {!loadAcceptedRejected && <div className="lds-dual-ring"></div>}

                        </div>
                        <div className="card-footer">
                           <h5 className="card-title"> <i className="fa fa-tachometer-alt"></i> accepted rate</h5>
                        </div>
                      </div>{/* .card Accepted */ }
                      </div>
                  </div>
                  <div className="row mt-lg-4">
                      <div className="col-md-6 col-sm-6">
                        {/* card HW */ }
                        <div className="m-2 card red">
                          <div className="card-body">
                            {!summary.mHs && <div className="lds-dual-ring"></div>}
                            {summary.mHs &&
                            <p className="card-text">
                              {convertHashRate(summary.mHs)}
                            </p>
                            }
                          </div>
                          <div className="card-footer">
                             <h5 className="card-title"> <i className="fa fa-tachometer-alt"></i> hash rate</h5>
                          </div>
                        </div>{/* .card HW */ }
                      </div>
                      <div className="col-md-6 col-sm-6">
                      {/* card HW */ }
                      <div className="m-2 card blue">
                        <div className="card-body">
                          {!summary.fansSpeed && <div className="lds-dual-ring"></div>}
                          {summary.fansSpeed &&
                          <p className="card-text">
                           {summary.fansSpeed+"%"}
                          </p>
                          }
                        </div>
                        <div className="card-footer">
                           <h5 className="card-title"> <i className="fa fa-asterisk"></i> fan speed</h5>
                        </div>
                      </div>{/* .card HW */ }
                      </div>
                  </div>
               </div>

               <div className="col-lg-7 col-md-12 mt-2">
                 {showGraph &&
                  <div className="box">
                    <div className="box-body">

                      <Line data={hashRatesData} options={options} height={268}/>


                    </div>
                  </div>
                  }
                  {!showGraph &&
                    <div className="alert alert-info m-5">
                      <h4 className="alert-heading">Hash Rate Graph</h4>
                      <p>Gathering data: graph will display shortly</p>
                    </div>
                  }
               </div>
              </div>
       </div>{/* ./col */}
    </div>{/* ./row */}



      {/* Box Pools */}
      <div className="row mt-5">
         <div className="col-md-12">
           <div className="box">
               <div className="box-header">
                 <h3>Pools {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
               </div>
               <div className="box-body">
                 <div className="table-responsive">
                   <table className="table">
                     <thead>
                       <tr>
                         <th scope="col">#</th>
                         <th scope="col">Pool</th>
                         <th scope="col">User</th>
                         <th scope="col">Status</th>
                         <th scope="col">Get Works</th>
                         <th scope="col">Accepted / Rejected</th>
                       </tr>
                     </thead>
                     <tbody id="bodyPools">
                     {pools.map(pool => (
                       <tr key={pool.POOL}>
                        <td>{parseInt(pool.POOL)+1}</td>
                        <td>{pool.URL}</td>
                        <td className="text-break">{pool.User}</td>
                        <td>{pool.Status==="Alive" ? <span className="badge badge-success font-normal">Alive</span>:<span className="badge badge-warning font-normal">Dead</span>}</td>
                        <td>{pool.Getworks}</td>
                        <td>{pool.Accepted}/{pool.Rejected}</td>
                       </tr>
                     ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
         </div>
      </div>
      {/* ./Box Pools */}
      {/* Box Miner Info */}
       <div className="row mt-5">
          <div className="col-md-12">
            <div className="box">
              <div className="box-header">
                <h3>Miner Info {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
              </div>
              <div className="box-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Hash Rate</th>
                        <th scope="col">Status</th>
                        <th scope="col">Accepted Rejected</th>
                        <th scope="col">HW</th>
                        <th scope="col">Temperature</th>
                      </tr>
                    </thead>
                    <tbody id="bodyMinerInfo">
                    {chains.map(chain => (
                      <tr key={chain.ASC}><td>{parseInt(chain.ASC)+1}</td>
                      <td>{convertHashRate(chain["Hash Rate"])}</td>
                      <td>{chain.Status==="Alive" ? <span className="badge badge-success font-normal">Alive</span>:<span className="badge badge-warning font-normal">Dead</span>}</td>
                      <td>{chain.Accepted}/{chain.Rejected}</td>
                      <td>{chain["Hardware Errors"]}</td>
                      <td>

                      {chain.Temperature &&
                        <span className="badge badge-temp">{Math.round(chain.Temperature)} &#8451;</span>
                      }
                      {chain.TempMIN &&
                        <span className="badge badge-temp small mr-1">{Math.round(chain.TempMIN)} &#8451;</span>
                      }
                      {chain.TempAVG &&
                        <span className="badge badge-temp small mr-1">{Math.round(chain.TempAVG)} &#8451;</span>
                      }
                      {chain.TempMAX &&
                        <span className="badge badge-temp small">{Math.round(chain.TempMAX)} &#8451;</span>
                      }
                      </td></tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
       </div>
       {/* Box Miner Info */}

      </div>
    );
  }
}

export default Homepage;

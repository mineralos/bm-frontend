import React, { Component } from 'react';
import axios from 'axios';
import {formatUpTime,convertHashRate} from '../lib/utils'
import { withRouter, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import {getStorage,setStorage,deleteStorage,generateUrlEncoded} from '../lib/utils'


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
      "redirectToLogin":false
    };

  }


  componentDidMount() {
    this.loadInfo();

  }

  componentWillUnmount() {
    if (typeof this.timeOutReload !== 'undefined')
      clearTimeout(this.timeOutReload);
    if (typeof this.timeOutLoad !== 'undefined')
      clearTimeout(this.timeOutLoad);
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
          fansSpeed=res.data.HARDWARE["Fan duty"];
          chains.forEach(function(chain)  {
            accepted+=parseInt(chain["Accepted"]);
            rejected+=parseInt(chain["Rejected"]);
            hwErrors+=parseInt(chain["Hardware Errors"]);
            mHs+=parseFloat(chain["MHS av"]);
          });
          const summary = {"accepted":accepted,"rejected": rejected, "hwErrors":hwErrors, "mHs":mHs, "upTime":upTime, "fansSpeed":fansSpeed}
          const pools = res.data.POOLS;
          this.setState({
            pools: pools,
            chains: chains,
            summary: summary,
            isLoaded: true,
            isRestarting: false,
            isRebooting:false
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
    const { pools, chains, summary, isLoaded, isRestarting, isRebooting, redirectToLogin } = this.state;

    if (redirectToLogin) {
      return <Redirect to="/login?expired" />;
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
           <div className="box">
               <div className="box-header">
                 <h3>Summary {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
               </div>

               <div className="box-body">
                 <div className="table-responsive">
                   <table className="table">
                     <thead>
                       <tr>
                         <th scope="col">Running Time</th>
                         <th scope="col">Hash Rate</th>
                         <th scope="col">Accepted / Rejected</th>
                         <th scope="col">HW</th>
                         <th scope="col">Fan Speed</th>
                       </tr>
                     </thead>
                     <tbody id="bodyMinerStatus">
                     {isLoaded &&
                     <tr><td>{formatUpTime(summary.upTime)}</td><td>{convertHashRate(summary.mHs)}</td><td>{summary.accepted}/{summary.rejected}</td><td>{summary.hwErrors}</td><td>{summary.fansSpeed}%</td></tr>
                     }
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
         </div>
      </div>
      {/* ./Box Summary */}
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
                       <tr key={pool.POOL}><td>{parseInt(pool.POOL)+1}</td><td>{pool.URL}</td><td>{pool.User}</td><td>{pool.Status==="Alive" ? <span className="badge badge-success font-normal">Alive</span>:<span className="badge badge-warning font-normal">Dead</span>}</td><td>{pool.Getworks}</td><td>{pool.Accepted}/{pool.Rejected}</td></tr>
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
                      <td>{convertHashRate(chain["MHS av"])}</td>
                      <td>{chain.Status==="Alive" ? <span className="badge badge-success font-normal">Alive</span>:<span className="badge badge-warning font-normal">Dead</span>}</td>
                      <td>{chain.Accepted}/{chain.Rejected}</td>
                      <td>{chain["Hardware Errors"]}</td>
                      <td><span className="badge badge-temp">{Math.round(chain.Temperature)} &#8451;</span></td></tr>
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

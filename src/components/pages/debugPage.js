import React, { Component } from 'react';
import axios from 'axios';
import {getStorage,setStorage,deleteStorage,generateUrlEncoded} from '../lib/utils'

import {
  Redirect
} from 'react-router-dom';

class Debugpage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      "isLoaded":false,
      "boards": [],
      "redirectToLogin":false,
      "hashes": []
    };

  }


  componentDidMount() {

    var page=this;
    var token=getStorage("jwt");
    if (token===null) {
      this.setState({"redirectToLogin":true});
    } else {
        var postData = {

        };
        let axiosConfig = {
          headers: {
              'Authorization': 'Bearer ' + token
          }
        };
        axios.post(window.customVars.urlPrefix+window.customVars.apiDebug,postData,axiosConfig)
        .then(res => {
          if (res.data.success&&res.data.boards&&res.data.boards.length>0) {
            page.setState({"isLoaded":true,"boards":res.data.boards,"hashes":res.data.hashes});

          } else {
            if ((typeof res.data.token !== 'undefined')&&res.data.token!==null&&res.data.token==="expired") {
                deleteStorage("jwt");
                page.setState({"redirectToLogin":true});
            }
          }

          })
          .catch(function (error) {

          });
    }

  }

  render() {
    const { isLoaded, redirectToIndex,redirectToLogin,boards,hashes } = this.state;

    if (redirectToLogin) {
      return <Redirect to="/login?expired" />;
    }

    return (
      <div className="Debugpage">

      <h1>Debug<br/><small>Miner Stats and Versions</small></h1>

      <div className="row">

          {/* Box  */}
           <div className="col-md-12 mt-5">
             <div className="box">
               <div className="box-header">
                 <h3>Miner Debug {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
               </div>
                <div className="box-body p-4">
                <h4>GIT hashes</h4>
                <div className="row">
                  <div className="col-md-3 field-title">
                    Firmware
                  </div>
                  <div className="col-md-9 field-value">
                    {hashes.firmware && hashes.firmware}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-3 field-title">
                    CgMiner
                  </div>
                  <div className="col-md-9 field-value">
                    {hashes.cgminer && hashes.cgminer}
                  </div>
                </div>
                <div className="row  mt-2">
                  <div className="col-md-3 field-title">
                    Backend
                  </div>
                  <div className="col-md-9 field-value">
                    {hashes.backend && hashes.backend}
                  </div>
                </div>
                <hr />
                <h4>Boards</h4>
                {boards.map((item, index) => (
                  <div key={index} className="mt-3">
                    <h5>Board {item.board["Chain ID"]+1}</h5>

                    <div className="row small">
                        {Object.keys(item.board).map(function(key) {
                          return <div className="col-md-6" key={key}>
                           <b>{key}:</b> {item.board[key]!==false && item.board[key] }{item.board[key]===false&&"false"}{item.board[key]===true&&"true"}
                         </div>
                        })}
                    </div>

                    <button className="btn btn-primary mt-2" type="button" data-toggle="collapse" data-target={"#collapse"+index} aria-expanded="false" aria-controls={"collapse"+index}>
                           Show Chips
                    </button>
                    <div className="collapse small" id={"collapse"+index}>

                        <table className="table table-striped mt-2">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">HW errors</th>
                                <th scope="col">Stales</th>
                                <th scope="col">Nonces found</th>
                                <th scope="col">Nonce ranges</th>
                                <th scope="col">Cooldown</th>
                                <th scope="col">Fail count</th>
                                <th scope="col">Fail reset</th>
                                <th scope="col">Temp</th>
                                <th scope="col">Vol</th>
                                <th scope="col">PLL</th>
                                <th scope="col">Pll Optimal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {item.chips.map((chip, indexChip) => (
                                <tr key={indexChip}>
                                  <td>{indexChip+1}</td>
                                  <td>{chip["HW errors"]}</td>
                                  <td>{chip["Stales"]}</td>
                                  <td>{chip["Nonces found"]}</td>
                                  <td>{chip["Nonce ranges"]}</td>
                                  <td>{chip["Cooldown"]}</td>
                                  <td>{chip["Fail count"]}</td>
                                  <td>{chip["Fail reset"]}</td>
                                  <td>{chip["Temp"]}</td>
                                  <td>{chip["nVol"]}</td>
                                  <td>{chip["PLL"]}</td>
                                  <td>{chip["pllOptimal"]?chip["pllOptimal"]:"false"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                    </div>
                      <hr/>
                  </div>

                ))}
                </div>
             </div>
           </div>
           {/* ./ Box  */}
        </div>

      </div>
    );
  }
}

export default Debugpage;

import React, { Component } from 'react';
import axios from 'axios';
import {
  Redirect
} from 'react-router-dom';

import {getStorage,deleteStorage,isUrlValid,generateUrlEncoded} from '../lib/utils'

class Poolspage extends Component {

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      pools: [{
        "url":"",
        "user":"",
        "pass":""
      },{
        "url":"",
        "user":"",
        "pass":""
      },{
        "url":"",
        "user":"",
        "pass":""
      }],
      fieldsValidation: {
        "Password1":true,
        "Password2":true,
        "Password3":true,
        "Pool1":true,
        "Pool2":true,
        "Pool3":true,
        "UserName1":true,
        "UserName2":true,
        "UserName3":true
      },
      updatingPools: false,
      isLoaded: false,
      showAlert: false,
      redirectToIndex:false,
      type: "",
      poolsUpdated:false,
      errorUpdating:false,
      redirectToLogin:false,
      hasErrors:false
    };


  }


  componentDidMount() {
    var { pools,fieldsValidation,isLoaded,showAlert,updatingPools,redirectToIndex } = this.state;
    var token=getStorage("jwt");
    if (token===null) {
      this.setState({"redirectToLogin":true});
    } else {
      var comp=this;
      var postData = {

      };
      let axiosConfig = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
      };
      axios.post(window.customVars.urlPrefix+window.customVars.apiConfigPools,postData,axiosConfig)
      .then(res => {
        if (res.data.success === true) {
          if (res.data.pools instanceof Array) {
            var receivedPools=[];
            for (var i=0;i<3;i++) {
            if (res.data.pools[i] !== void 0) {
              var url="";
              var user="";
              var pass="";
              if (typeof res.data.pools[i].url !== 'undefined') {
                url=res.data.pools[i].url;
              }
              if (typeof res.data.pools[i].user !== 'undefined') {
                user=res.data.pools[i].user;
              }
              if (typeof res.data.pools[i].pass !== 'undefined') {
                pass=res.data.pools[i].pass;
              }
              receivedPools[i]={"url":url,"user":user,"pass":pass};
            } else {
              receivedPools[i]={"url":"","user":"","pass":""};
            }

            }


            comp.setState({
              pools: receivedPools,
              isLoaded: true
            });
          }
        } else {
          if ((typeof res.data.token !== 'undefined')&&res.data.token!==null&&res.data.token==="expired") {
              deleteStorage("jwt");
              comp.setState({"redirectToLogin":true});
          } else {
            comp.setState({
              isLoaded: true
            });
          }

        }
      });


    }

  }

  handleInputChange(event) {
   var { pools } = this.state;

   const target = event.target;
   const name = target.name;
   const pool = target.getAttribute('data-pool');
   pools[pool][name]=target.value;

   this.setState({pools: pools});
  }

  handleSubmit(event) {
    event.preventDefault();


    var { pools,fieldsValidation,isLoaded,showAlert,updatingPools,redirectToIndex } = this.state;

    fieldsValidation={
      "Password1":true,
      "Password2":true,
      "Password3":true,
      "Pool1":true,
      "Pool2":true,
      "Pool3":true,
      "UserName1":true,
      "UserName2":true,
      "UserName3":true
    }
    var hasErrors=false;
    //Pool 1 is always required
    if (pools[0].url==""||!isUrlValid(pools[0].url)) {
      fieldsValidation["Pool1"]=false;
      hasErrors=true;
    }
    if (pools[0].user=="") {
      fieldsValidation["UserName1"]=false;
      hasErrors=true;
    }
    if (pools[0].pass=="") {
      fieldsValidation["Password1"]=false;
      hasErrors=true;
    }

    //Pool 2
    if (pools[1].url!="") {
      if (!isUrlValid(pools[1].url)) {
        fieldsValidation["Pool2"]=false;
        hasErrors=true;
      }
      if (pools[1].user=="") {
        fieldsValidation["UserName2"]=false;
        hasErrors=true;
      }
      if (pools[1].pass=="") {
        fieldsValidation["Password2"]=false;
        hasErrors=true;
      }
    } else {
      if (pools[1].user!="") {
        fieldsValidation["Pool2"]=false;
        hasErrors=true;
      }
      if (pools[1].pass!="") {
        fieldsValidation["Pool2"]=false;
        hasErrors=true;
      }
    }
    //Pool 3
    if (pools[2].url!="") {
      if (!isUrlValid(pools[2].url)) {
        fieldsValidation["Pool3"]=false;
        hasErrors=true;
      }
      if (pools[2].user=="") {
        fieldsValidation["UserName3"]=false;
        hasErrors=true;
      }
      if (pools[2].pass=="") {
        fieldsValidation["Password3"]=false;
        hasErrors=true;
      }
    }  else {
      if (pools[2].user!="") {
        fieldsValidation["Pool3"]=false;
        hasErrors=true;
      }
      if (pools[2].pass!="") {
        fieldsValidation["Pool3"]=false;
        hasErrors=true;
      }
    }

    if (!hasErrors) {
        this.setState({hasErrors:false,fieldsValidation:fieldsValidation});
        var token=getStorage("jwt");
        if (token===null) {
          this.setState({"redirectToLogin":true});
        } else {
            if (updatingPools)
              return;

              var postPools=[];
              for (var i=0;i<3;i++) {
                if (pools[i].url!=null&&pools[i].url!="") {
                  postPools["Pool"+(i+1)]=pools[i].url;
                } else {
                  postPools["Pool"+(i+1)]="";
                }
                if (pools[i].user!=null&&pools[i].user!="") {
                  postPools["UserName"+(i+1)]=pools[i].user;
                } else {
                  postPools["UserName"+(i+1)]="";
                }
                if (pools[i].pass!=null&&pools[i].pass!="") {
                  postPools["Password"+(i+1)]=pools[i].pass;
                } else {
                  postPools["Password"+(i+1)]="";
                }

              }


              var strSend = generateUrlEncoded(postPools);

              var comp=this;
              comp.setState({updatingPools:true});
              let axiosConfig = {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
              };
              axios.post(window.customVars.urlPrefix+window.customVars.apiUpdatePools, strSend,axiosConfig)
              .then(function (response) {
                if(response.data.success === true){
                    comp.setState({poolsUpdated:true});
                    setTimeout(() => {
                      comp.setState({redirectToIndex:true});
                    }, 5000);
                } else if(response.data.success === true) {
                  comp.setState({errorUpdating:true,updatingPools:false});
                }
              })
              .catch(function (error) {
                comp.setState({updatingPools:false});
              });

          }
        } else {
            this.setState({hasErrors:true,fieldsValidation:fieldsValidation});
        }
  }


  render() {
    const { pools,fieldsValidation,isLoaded,showAlert,updatingPools,redirectToIndex,type,poolsUpdated,errorUpdating,redirectToLogin,hasErrors } = this.state;
    if (redirectToIndex) {
      return <Redirect to="/?restarting" />;
    }
    if (redirectToLogin) {
      return <Redirect to="/login?expired" />;
    }
    var token=getStorage("jwt");
    var user=getStorage("userName");
    var isAdmin=false;
    if (token!==null&&user!==null) {
      if (user=="admin")
        isAdmin=true;
    }


    return (
      <div className="Poolspage">

      <h1>Settings<br/><small>Mining Pools</small></h1>

          {poolsUpdated &&
            <div className="alert alert-success mt-5">
              Pools updated successfully! Restarting service, please wait <div className="btn-loader lds-dual-ring pt-1"></div>
            </div>
          }

          {errorUpdating &&
            <div className="alert alert-warning mt-5">
              It was not possible to restart the service, please restart the miner manually
            </div>
          }

          {hasErrors &&
            <div className="alert alert-warning mt-5">
              Some fields in your form are invalid, please check the fields highlighted in red.
            </div>
          }


          <div className="alert alert-info mt-5">
            Please ensure that your pools are compatible with stratum version-rolling extension
          </div>

          <div className="row">
              {/* Box Pool 1 */}
             <div className="col-md-12 mt-5">
               <div className="box">
                 <div className="box-header">
                   <h3>Pool 1  {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
                 </div>
                     {isLoaded &&
                     <div className="box-body p-4">
                        <div className={"form-group " + (!fieldsValidation.Pool1 && "has-error")}>
                          <label htmlFor="inputURL1">URL</label>
                            <div className="input-group mb-2">
                              <input type="text" className="form-control form-control-sm"  data-pool="0" name="url" value={this.state.pools[0].url} onChange={this.handleInputChange} id="inputURL1" placeholder="Pool URL" />
                            </div>
                        </div>
                        <div className={"form-group " + (!fieldsValidation.UserName1 && "has-error")}>
                          <label htmlFor="inputWorker1">Worker</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="fa fa-user"></i></div>
                                </div>
                                <input type="text" className="form-control form-control-sm"  data-pool="0" name="user"  value={this.state.pools[0].user} onChange={this.handleInputChange} id="inputWorker1" placeholder="Pool Worker" />
                            </div>
                        </div>
                        <div className={"form-group " + (!fieldsValidation.Password1 && "has-error")}>
                          <label htmlFor="inputPassword1">Password</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="fa fa-lock"></i></div>
                                </div>
                                <input type="text" className="form-control form-control-sm"  data-pool="0" name="pass" value={this.state.pools[0].pass} onChange={this.handleInputChange} id="inputPassword1" placeholder="Pool Password" />
                            </div>
                        </div>
                     </div>
                     }
                     {/* ./box-body */}
               </div>
             </div>
             {/* ./ Box Pool 1 */}
          </div>

          <div className="row">
              {/* Box Pool 2 */}
              <div className="col-md-6 mt-5">
                  <div className="box">
                      <div className="box-header">
                          <h3>Pool 2  {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
                      </div>
                      {isLoaded &&
                      <div className="box-body p-4">
                          <div className={"form-group " + (!fieldsValidation.Pool2 && "has-error")}>
                              <label htmlFor="inputURL2">URL</label>
                              <div className="input-group mb-2">
                                  <input type="text" className="form-control form-control-sm"  data-pool="1" name="url" value={this.state.pools[1].url} onChange={this.handleInputChange} id="inputURL2" placeholder="Pool URL" />
                              </div>
                          </div>
                          <div className={"form-group " + (!fieldsValidation.UserName2 && "has-error")}>
                              <label htmlFor="inputWorker2">Worker</label>
                              <div className="input-group mb-2">
                                  <div className="input-group-prepend">
                                      <div className="input-group-text"><i className="fa fa-user"></i></div>
                                  </div>
                                  <input type="text" className="form-control form-control-sm"  data-pool="1" name="user" value={this.state.pools[1].user} onChange={this.handleInputChange} id="inputWorker2" placeholder="Pool Worker" />
                              </div>
                          </div>
                          <div className={"form-group " + (!fieldsValidation.Password2 && "has-error")}>
                              <label htmlFor="inputPassword2">Password</label>
                              <div className="input-group mb-2">
                                  <div className="input-group-prepend">
                                      <div className="input-group-text"><i className="fa fa-lock"></i></div>
                                  </div>
                                  <input type="text" className="form-control form-control-sm"  data-pool="1" name="pass" value={this.state.pools[1].pass} onChange={this.handleInputChange} id="inputPassword2" placeholder="Pool Password" />
                              </div>
                          </div>
                      </div>
                      }
                      {/* ./box-body */}
                  </div>
              </div>
              {/* ./ Box Pool 2 */}




              {/* Box Pool 3 */}
              <div className="col-md-6 mt-5">
                  <div className="box">
                      <div className="box-header">
                          <h3>Pool 3  {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
                      </div>
                      {isLoaded &&
                      <div className="box-body p-4">
                          <div className={"form-group " + (!fieldsValidation.Pool3 && "has-error")}>
                              <label htmlFor="inputURL3">URL</label>
                              <div className="input-group mb-2">
                                  <input type="text" className="form-control form-control-sm"  data-pool="2" name="url" value={this.state.pools[2].url} onChange={this.handleInputChange} id="inputURL3" placeholder="Pool URL" />
                              </div>
                          </div>
                          <div className={"form-group " + (!fieldsValidation.UserName3 && "has-error")}>
                              <label htmlFor="inputWorker3">Worker</label>
                              <div className="input-group mb-2">
                                  <div className="input-group-prepend">
                                      <div className="input-group-text"><i className="fa fa-user"></i></div>
                                  </div>
                                  <input type="text" className="form-control form-control-sm"  data-pool="2" name="user" value={this.state.pools[2].user} onChange={this.handleInputChange} id="inputWorker3" placeholder="Pool Worker" />
                              </div>
                          </div>
                          <div className={"form-group " + (!fieldsValidation.Password3 && "has-error")}>
                              <label htmlFor="inputPassword3">Password</label>
                              <div className="input-group mb-2">
                                  <div className="input-group-prepend">
                                      <div className="input-group-text"><i className="fa fa-lock"></i></div>
                                  </div>
                                  <input type="text" className="form-control form-control-sm"  data-pool="2" name="pass" value={this.state.pools[2].pass} onChange={this.handleInputChange} id="inputPassword3" placeholder="Pool Password" />
                              </div>
                          </div>
                      </div>
                      }
                      {/* ./box-body */}
                  </div>
              </div>
              {/* ./ Box Pool 3 */}




          </div>
          {/* ./row */}

          <div className="row mt-5">

              {isAdmin &&
              <div className="col-md-12 text-center">

              <br />
                    <button ref="btn" disabled={!isLoaded||updatingPools} onClick={this.handleSubmit} className="btn btn-primary">Update Pools {updatingPools && <div className="btn-loader lds-dual-ring"></div>}</button>
                  {showAlert &&
                  <div id="poolsAlert" className="alert alert-warning mt-3">
                      Please check your pools configuration, invalid fields are in red!
                  </div>
                  }
              </div>
              }
          </div>

      </div>
    );
  }
}

export default Poolspage;

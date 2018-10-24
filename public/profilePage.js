import React, { Component } from 'react';
import axios from 'axios';
import {generateUrlEncoded,getStorage,deleteStorage} from '../lib/utils'
import { Redirect, Link } from 'react-router-dom';

class Profilepage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      "alertMessage": "",
      "isLoaded": false,
      "hasAutoTune": false,
      "hasAutoTuneDefault": true,
      "redirectToLogin": false,
      "saving": false,
      "formChanged": false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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
        axios.post(window.customVars.urlPrefix+window.customVars.apiHasAgeing,postData,axiosConfig)
        .then(res => {
          if (res.data.success === true) {
            page.setState({"isLoaded":true,"hasAutoTune":res.data.hasAutoTune,"hasAutoTuneDefault":res.data.ageing});
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


  handleSubmit(event) {
    var { hasAutoTune } = this.state;
    event.preventDefault();
    var token=getStorage("jwt");
    var page=this;
    if (token===null) {
      this.setState({"redirectToLogin":true});
    } else {
      var params = new URLSearchParams();
      params.append('autotune', hasAutoTune);
      let axiosConfig = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
      };
      this.setState({"saving":true});
      axios.post(window.customVars.urlPrefix+window.customVars.apiSetAutoTune,params,axiosConfig)
      .then(res => {
        if (res.data.success === true) {
          this.setState({"saving":false,"saved":true,"hasAutoTuneDefault":hasAutoTune,"formChanged":false});
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

  componentWillUnmount() {
    if (typeof this.timeOutLogs !== 'undefined')
      clearTimeout(this.timeOutLogs);
  }


  handleInputChange(event) {
   const target = event.target;
   const value = target.type === 'checkbox' ? target.checked : target.value;
   const name = target.name;
   if (name=="autotune") {
     var formChanged=(this.state.hasAutoTuneDefault!=value);
     this.setState({"hasAutoTune":value,"formChanged":formChanged});
   }
  }

  render() {
    var { alertMessage,isLoaded,hasAutoTune,redirectToLogin,saving,formChanged,saved } = this.state;

    if (redirectToLogin) {
      return <Redirect to="/login?expired" />;
    }

    return (
      <div className="Profilepage">

      <h1>Miner Profile<br/><small>Performance</small></h1>


      <div className="row">

          {/* Box */}
         <div className="col-md-12 mt-5">
           <div className="box">
             <div className="box-header">
               <h3>Profiles {!isLoaded && <div className="lds-dual-ring pull-right"></div>}</h3>
             </div>


                 <div className="box-body p-4">
                 {saved &&
                     <div className="alert alert-success">
                       Profile configuration updated.
                     </div>
                 }

                   <div className="row">
                      <div className="col-md-12 text-center">
                        <p className="small text-left">There are two modes for your miner</p>
                        <ol className="small text-left">
                          <li>Auto Tune Enabled: The miner will dynamically search the voltage and frequency values for your miner.</li>
                          <li>Auto Tune Disabled (default value and recommended): The miner will work with the factory default values or the best values found during device calibration.</li>
                        </ol>

                        <h3 className="color-title">Auto tune: </h3>
                        <label className="switch">
                          <input disabled={!isLoaded} type="checkbox" checked={hasAutoTune} onChange={this.handleInputChange} name="autotune" />
                          <span className="slider"></span>
                        </label><br />



                      </div>
                    </div>





                 </div>
                 <div className="box-footer clearfix">
                      <button disabled={!formChanged||saving} className="btn btn-primary pull-left" onClick={this.handleSubmit}>Save {saving && <div className="btn-loader lds-dual-ring"></div>}</button>
                      <Link to={'/calibration'} className="pull-right"><button className="btn btn-secondary">Run Calibrate</button></Link>


                 </div>
           </div>
         </div>
         {/* .Box */}


      </div>
      {/* ./row */}

      </div>
    );
  }
}

export default Profilepage;

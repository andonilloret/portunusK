
var JobTable = React.createClass({
  getInitialState: function() {
    socket.on('cachedOK', this.refreshJobList);
    return {"jobs": jobs}
  },
  render: function(){
    var getJobs = this.getJobs();
    return(<table className = "table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Status</th>
                <th>Hora de Ejecución</th>
              </tr>
            </thead>
            <tbody>
              {getJobs}
            </tbody>
          </table>);
  },
  getJobs: function(){
    var rctx = this;
    return rctx.state.jobs.map(function(job){
      var executionDate = (job.jobStart) ? String(new Date(job.jobStart)) : "";
      return (<tr>
                <td>{job.key}</td>
                <td>{(job.jobStart)? "Running" : "Queued"}</td>
                <td>{executionDate}</td>
              </tr>);
    });
  },
  refreshJobList: function(){
    var rctx = this;
    $.ajax({
      //TODO: Parametrizar platformPrefix
      url: 'api/platforms/' + 'isv' + '/getjobs',
      type: 'GET',
      success: function(result) {
        rctx.state.jobs = result.data;
        rctx.forceUpdate();
      }
    });
  }
});

ReactDOM.render(
  <JobTable/>,
  document.getElementById('jobTable')
);

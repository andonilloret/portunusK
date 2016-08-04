var vertical = {
    1: "Cliente",
    2: "Sub Cadena",
    3: "Región",
    4: "Comuna",
    5: "Local",
    6: "KAS",
    8: "Marca",
    7: "Descripción producto",
    9: "Categoría",
    10: "Sub Categoría",
    11: "Tamaño/Contenido",
    12: "SAP"
  }

var ClientList = React.createClass({
  getInitialState: function(){
    var reducedClients = keys.reduce(function(rItems, item){
      var clientName = item.key.match(/[a-z0-9]+/ig)[1];
      if(rItems[clientName])
        rItems[clientName].count++;
      else
        rItems[clientName] = {"name": clientName, "count": 1}
      return rItems;
    },{});
    return {clients: reducedClients}
  },
  render: function(){
    var clientList = this.getClientList();
    return(
      <ul className = "list-group">
        {clientList}
      </ul>
    );
  },
  getClientList: function(){
    var clients = []
    for(var client in this.state.clients){
      var clientName = this.state.clients[client].name;
      var tbl = React.createElement(KeyTable, {"clientName": clientName});
      var refreshClientKeys = this.refreshClientKeys.bind(this, clientName);
      clients.push(
        <li className = "list-group-item client-li" onClick = {this.showKeyTable.bind(this.props)}>
          <span onClick = {refreshClientKeys} style = {{float: "right", marginLeft: "10px"}} className = "glyphicon glyphicon-refresh" aria-hidden = "true"></span>
          <span className = "badge">{this.state.clients[client].count}</span>
          {clientName}
          {tbl}
        </li>);
    }
    return clients;
  },
  refreshClientKeys: function(clientName){
    var rctx = this;
    $.ajax({
      url: '/api/clients/ISV.'+clientName+'/recache',
      type: 'PUT',
      timeout: 0,
      success: function(result) {
        console.log("Enviado el request para actualizar " + clientName);
      }
    });
  },
  showKeyTable: function(props){
    //$(".keytable").hide();
    //$(props.target).find("table").show()
  }
});

var KeyTable = React.createClass({
  getInitialState: function() {
    var regclient = new RegExp(this.props.clientName);
    var filteredKeys = keys.filter(function(item){
      return regclient.test(item.key);
    });
    return {keys: filteredKeys}
  },
  render: function() {
    var keyRows = this.generateRows();
    return (
      <table id={this.props.clientName} className = "table keytable">
        <thead>
          <tr>
            <th>View</th>
            <th>Vertical</th>
            <th>Horizontal</th>
            <th>Cached Time</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {keyRows}
        </tbody>
      </table>
    );
  },
  generateRows: function(){
    var deleteRedisKey = this.deleteRedisKey;
    var refreshRedisKey = this.refreshRedisKey;
    return this.state.keys.map(function(item){
      var cols = item.key.split('.');
      return(<tr key={item.key}>
              <td>{cols[2]}</td>
              <td>{vertical[cols[3]]}</td>
              <td>{cols[4]}</td>
              <td>{item.date}</td>
              <td><span onClick = {() => deleteRedisKey(item.key)} className = "glyphicon glyphicon-trash" aria-hidden = "true"></span></td>
              <td><span onClick = {refreshRedisKey.bind(this, item.key)} className = "glyphicon glyphicon-refresh" aria-hidden = "true"></span></td>
            </tr>);
    });
  },
  deleteRedisKey: function(key){
    var rctx = this;
    $.ajax({
      url: '/api/keys/' + key + '/delete',
      type: 'DELETE',
      success: function(result) {
        var keyIndex = rctx.state.keys.findIndex(function(item){ return item.key === key });
        if(keyIndex >= 0)
          rctx.state.keys.splice(keyIndex, 1);
        rctx.forceUpdate();
      }
    });
  },
  refreshRedisKey: function(key){
    var rctx = this;
    var keyIndex = rctx.state.keys.findIndex(function(item){ return item.key === key });
    $.ajax({
      url: '/api/keys/' + key + '/recache',
      type: 'PUT',
      timeout: 0,
      success: function(result) {
        rctx.state.keys[keyIndex].date = "Recacheando";
        rctx.forceUpdate();
      }
    });
  }

});

ReactDOM.render(
  <ClientList/>,
  document.getElementById('keyTable')
);

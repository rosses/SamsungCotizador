angular.module('samsungcot.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicPopup, $ionicLoading) {



})

.controller('HomeCtrl', function($scope, $state, $localStorage, $location, $timeout, $ionicLoading) {
  
  
  if (!$localStorage.app) { $localStorage.app = app;  }
  if ($localStorage.app.auth == 0) {
      $location.path( "login", false );
  }
  


  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };
  
  $scope.printerbox = {};
  $scope.cargandoPrinters = false;
  $scope.noPrinterFound = false;
  printers = [];
  $scope.printerList=printers;

  $scope.printRefresh = function() {
    //alert('printrefresh');
    $scope.cargandoPrinters = true;
    $scope.noPrinterFound = false;
    printers = [];
    $scope.printerList=printers;

    ble.startScan([], function(device) {
      //alert(JSON.stringify(device));
      printer = { nombre: device.name, id: device.id };
      printers.push(printer);
      /*var string = device.name,
      substring = "SAMSTORECC";
      if (string.indexOf(substring) !== -1) {
        app.impID = device.id;
        app.impNN = device.name;
        $localStorage.app = app;
        //alert('set default: '+device.id)
      }*/
    } , function(x) {
      // ERR
      alert('err:'+JSON.stringify(x));
    })

    $timeout(function() {
      //alert('timeout');

      $scope.cargandoPrinters = false;
      $scope.printerList=printers;

      if (printers.length == 0) {
        $scope.noPrinterFound = true;
      }

      ble.stopScan(function() {}, function() {});

    },5000)

  };

  $scope.imprimir = function() {
    if (app.impNN != "") {
      //alert('imprimir en '+app.impNN);
      function objetoImprimir() {

        var buffer = [];

        function _raw (buf) {
          buffer = buffer.concat(buf)
        }

        escpos(_raw)
        .hw()
        .set({align: 'center', width: 2, height: 2})
        .text('COTIZACION SAMSTORE')
        .newLine(1)
        .set({align: 'left', width: 1, height: 1})
        .text('COMPROBANTE VALIDO SOLO PARA CAJA')
        .newLine(1)
        .text('---------------------------')
        .newLine(3)
        .barcode('123456789','CODE39', 120, 3, 'BLW', 'B')
        .newLine(3)
        .barcode('12345678900','CODE128', 150, 3, 'BLW', 'A')
        .newLine(3)
        .barcode('12345678900','CODE128', 120, 4, 'BLW', 'B')
        .cut();

        return buffer;

      };

      var buffer = new Uint8Array(objetoImprimir()).buffer;

      ble.isConnected(app.impID, function() {
        ble.writeWithoutResponse(app.impID, app.impSERV, app.impCHAR, buffer, function(x) {  err('OK '+JSON.stringify(x)); }, function(x) { err('No se pudo imprimir '+JSON.stringify(x)); });
      }, function() {

        ble.connect(app.impID, function(peripheral) {
          $scope.hideload();
          ble.writeWithoutResponse(app.impID, app.impSERV, app.impCHAR, buffer, function(x) { }, function(x) { err('No se pudo imprimir '+JSON.stringify(x)); });
        }, function() { 
          err('Problemas al conectar a su impresora. Valla a configuracion o intente mas tarde.');
          $scope.hideload();
        });

      });

    }
    else {
      err('No se ha configurado una impresora');
    }
  };


  $scope.impActivar = function(item) {
  
    app.impNN = item.currentTarget.getAttribute("data-nombre");
    app.impID = $scope.printerbox.sel;
    $localStorage.app = app;

    ble.isConnected(app.impID, function() {
    }, function() {
        ble.connect(app.impID, function(peripheral) {
          $scope.hideload();
        }, function() { 
          err('Problemas al conectar a su impresora. Valla a configuracion o intente mas tarde.');
          $scope.hideload();
        });
    });
  };

  $scope.Productos = [];

})


.controller('MainCtrl', function($scope, $state, $localStorage, $location) {

  
})

.controller('LoginCtrl', function($scope, $ionicPopup, $ionicLoading, $localStorage, $state, $location) {
  $scope.user = {
    username: '',
    password : ''
  };

  if (!$localStorage.app) { $localStorage.app = app; }
  else {
    if ($localStorage.app.auth == 1) {
      //$location.path( "home/main", false );
      $state.go( "home.main" );
    }
  }
  

  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };

  $scope.signIn = function(form) {
    //console.log(form);
    if(form.$valid) {
      $scope.showload();
      jQuery.post(app.restApi+"action=validarInstalacion", {clave: $scope.user.password}, function(data) {
        if (data.clave == 1) {
          app.auth = 1;
          $localStorage.app = app;         
          $state.go( "home.main" );
        }
        else {
          $ionicPopup.alert({
            title: 'No autorizado',
            content: 'La clave es inválida'
          }).then(function(res) {
            
          });
        }
        $scope.hideload();

      },"json");
      
    }
  };
});

function err(msg) {
  console.log(msg);
  navigator.notification.alert(
      (msg ? msg : 'Error al consultar el servicio. Intente más tarde'),  // message
      function() { },
      'Error',
      'OK'
  );
}

String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}


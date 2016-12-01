angular.module('samsungcot.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicPopup, $ionicLoading) {



})

.controller('HomeCtrl', function($scope, $state, $localStorage, $location, $timeout) {
  
  
  if (!$localStorage.app) { $localStorage.app = app;  }
  if ($localStorage.app.auth == 0) {
      $location.path( "login", false );
  }
  
  $scope.printerbox = {};
  $scope.cargandoPrinters = true;
  $scope.noPrinterFound = false;
  printers = [];
  $scope.printerList=printers;

  $scope.printRefresh = function() {
    //alert('printrefresh');
    ble.startScan([], function(device) {
      //alert(JSON.stringify(device));
      printer = { nombre: device.name, id: device.id };
      printers.push(printer);
      var string = device.name,
      substring = "SAMSTORECC";
      if (string.indexOf(substring) !== -1) {
        app.impID = device.id;
        app.impNN = device.name;
        $localStorage.app = app;
        alert('set default: '+device.id)
      }
    } , function(x) {
      // ERR
      alert('err:'+JSON.stringify(x));
    })

    $timeout(function() {
      alert('timeout');

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
      var buffer = new MutableBuffer(/* initialSize, blockSize */);

      var code = "00015742";
      var type = "CODE128";
      var width = "200";
      var height = "4";
      var position = "BLW";
      var font = "A";
      if(width >= 1 || width <= 255){
        buffer.write(_.BARCODE_FORMAT.BARCODE_WIDTH);
      }
      if(height >=2  || height <= 6){
        buffer.write(_.BARCODE_FORMAT.BARCODE_HEIGHT);
      }
      buffer.write(_.BARCODE_FORMAT[
        'BARCODE_FONT_' + (font || 'A').toUpperCase()
      ]);
      buffer.write(_.BARCODE_FORMAT[
        'BARCODE_TXT_' + (position || 'BLW').toUpperCase()
      ]);
      buffer.write(_.BARCODE_FORMAT[
        'BARCODE_' + ((type || 'EAN13').replace('-', '_').toUpperCase())
      ]);
      buffer.write(code);

      ble.writeWithoutResponse(app.impID, app.impSERV, app.impCHAR, buffer, function(x) { 
        err('OK'); 
      }, function(x) { 
        err('No se pudo imprimir');
      });
    }
    else {
      err('No se ha configurado una impresora');
    }
  };


  $scope.impActivar = function(item) {

    if (app.impID != null) {
      ble.isConnected(amp.impID, function() {
        ble.disconnect(amp.impID, function() {}, function() {});
      }, function() {

      });
    }

    app.impNN = item.currentTarget.getAttribute("data-nombre");
    app.impID = $scope.printerbox.sel;
    $localStorage.app = app;

    ble.connect(app.impID, function(peripheral) {
      $location.path( "main/home", false ); 
      $ionicLoading.hide();
    }, function() { 
      err('Problemas al conectar a su impresora. Intente mas tarde.');
      $ionicLoading.hide();
    });
  };


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
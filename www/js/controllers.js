//
angular.module('samsungcot.controllers', [])

.controller('AddCtrl', function($scope, $ionicScrollDelegate, filterFilter, $state, $location, $anchorScroll, $stateParams) {
	$scope.showload();
	$scope.addprod = {};
	//alert($scope.cotLista.length);
  res = [];
  $scope.resList=res;

	jQuery.post(app.restApi+'services/?action=buscar&store_code=002', { str: $stateParams.search }, function(data) {
		$scope.hideload();
		//alert(JSON.stringify(data));
		if (data.items.length == 0) {
			err("No se encontraron productos");
			$state.go("home.main");
		}
		else {
			jQuery.each(data.items, function(index) {
				res.push(data.items[index]);
			});
			//alert($scope.cotLista.length);
		}
	},"json").fail(function() { err("No responde el servidor, revise su conexión a internet"); });

	$scope.cancelarAgregar = function() {
		$state.go("home.main");
	};

	$scope.agregarSeleccion = function(item) {
		if (item) { //$scope.addprod.sel
			// verificar existe
			var modificaExistente = 0;
			for (var i = 0; i < $scope.cotLista.length ; i++) {
				if ($scope.cotLista[i].codigo == item.codigo) {
					$scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) + 1);
					$scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
					modificaExistente = 1;
					break;
				}
			}

			if (modificaExistente == 0) {
				item.cantidad = 1;
				item.total = (parseInt(item.precio) * 1);
				$scope.cotLista.push(item);
			}

			$scope.calcularTotales();
			$state.go("home.main");

		}
		else {
			err('No esta agregando nada');
		}
	};


})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicPopup, $ionicLoading) {

})

.controller('HomeCtrl', function($scope, $state, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup) {
  
  
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

  $scope.cotLista = [];
  $scope.printerbox = {};
  $scope.cargandoPrinters = false;
  $scope.noPrinterFound = false;
  printers = [];
  $scope.printerList=printers;

	$scope.limpiarCotizacion = function() {
    navigator.notification.confirm(
        'Esta seguro?',  // message
        function(buttonIndex) {
        	if (buttonIndex == 1) {
        		$scope.cotLista = [];
        	}
        },              // callback to invoke with index of button pressed
        'Limpiar cotizacion',            // title
        'Si,No'          // buttonLabels
    );
		
	};
  $scope.algo = "";

	$scope.agregarProducto = function() {
    /*
		$state.go('home.add',{search: 'galaxy'});
		
    navigator.notification.prompt(
        'Ingrese texto a buscar',  // message
        function(results) { 
        	if (results.buttonIndex == 1) {
        		if (results.input1.length > 1) {
        			$state.go('home.add',{search: results.input1});
        		}
        		else {
        			err('Ingrese 2 letras a lo menos');
        		}
        	} 
        },                  // callback to invoke
        'Agregar producto',            // title
        ['Ok','Cancelar']              // buttonLabels
    );*/
    
    $scope.data = {}

    $ionicPopup.show({
      template: '<input type="text" ng-model="data.algo">',
      title: 'Buscar producto',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Cerrar' },
        {
          text: '<b>Buscar</b>',
          type: 'button-positive',
          onTap: function(e) {
             if (!$scope.data.algo) {
              e.preventDefault();
             } else {
              //alert($scope.data.algo);
              if ($scope.data.algo.length > 1) {
                $state.go('home.add',{search:$scope.data.algo});
              }
              else {
                err('Ingrese 2 letras a lo menos');
              }
             }
          }
        }
      ]
    });
    
	};


	$scope.neto = 0;
	$scope.iva = 0;
	$scope.total = 0;

	$scope.calcularTotales = function() {
		var neto = 0;
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			neto = parseInt(neto) + parseInt($scope.cotLista[i].total);
		}

		var iva = Math.round(neto * 0.19);
		var total = neto + iva;

		$scope.neto = neto;
		$scope.iva = iva;
		$scope.total = total;

	};

  $scope.printRefresh = function() {
    $scope.cargandoPrinters = true;
    $scope.noPrinterFound = false;
    printers = [];
    $scope.printerList=printers;
    /*
    ble.startScan([], function(device) {
      //err(JSON.stringify(device));
      printer = { nombre: device.name, id: device.id };
      printers.push(printer);

    } , function(x) {
      // ERR
      err('ERR: '+JSON.stringify(x));
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
  */
  bluetoothSerial.list(function(devices) {
      err(JSON.stringify(devices));
  }, function(e) { err('err'); err(JSON.stringify(e)); });

  };
  $scope.getCodigos = function() {
  	var ret = [];
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			ret.push($scope.cotLista[i].codigo);
		}
		return ret;
  }

  $scope.getCantidades = function() {
  	var ret = [];
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			ret.push($scope.cotLista[i].cantidad);
		}
		return ret;
  }

  $scope.imprimir = function() {
  	if ($scope.cotLista.length == 0) {
  		err("Cotizacion esta vacia");
  	}
    else if (app.impNN != "") {
      function objetoImprimir() {

        var buffer = [];
        function _raw (buf) {
          buffer = buffer.concat(buf)
        }

        escpos(_raw)
        .hw()
        .set({align: 'center', width: 1, height: 2})
        .text('COTIZACION')
        .newLine(1)
        .text('COMPROBANTE PARA CAJA')
        .newLine(1)
        .text('---------------------------')
        .newLine(1)
        .barcode($scope.getCodigos(),$scope.getCantidades(),'EAN13', 4, 90, 'BLW', 'B')
        .cut();

        return buffer;

      };

      var buffer = new Uint8Array(objetoImprimir()).buffer;
      /*
      var x = new Uint8Array(objetoImprimir());
      alert(JSON.stringify(x));
      */
      

      ble.isConnected(app.impID, function() {
        ble.writeWithoutResponse(app.impID, app.impSERV, app.impCHAR, buffer, function(x) { 
        	// Estaba conectado y todo OK 1
        	$scope.cotLista = [];
        }, function(x) { 
        	err('No se pudo imprimir '+JSON.stringify(x)); 
        });
      }, function() {

        ble.connect(app.impID, function(peripheral) {
          $scope.hideload();
          ble.writeWithoutResponse(app.impID, app.impSERV, app.impCHAR, buffer, function(x) {
          	// Me he conectado y todo OK 2
          	$scope.cotLista = [];
          }, function(x) { 
          	err('No se pudo imprimir '+JSON.stringify(x)); 
          });
        }, function() { 
        	$scope.hideload();
          err('Problemas al conectar a su impresora. Valla a configuracion. refrescar y reconecte para imprimir nuevamente.');
        });

      });

      
    }
    else {
      err('No se ha configurado una impresora');
    }
  };


  $scope.impActivar = function(item) {
  
  	$scope.showload();
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

})


.controller('MainCtrl', function($scope, $state, $localStorage, $location) {
	$scope.lineaMenos = function(codigo) {
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			if ($scope.cotLista[i].codigo == codigo) {
				if (parseInt($scope.cotLista[i].cantidad) < 1) {
					err("Minimo es 1");
				}
				else {
					$scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) - 1);
					$scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
				}
				break;
			}
		}
		$scope.calcularTotales();
	};

	$scope.lineaMas = function(codigo) {
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			if ($scope.cotLista[i].codigo == codigo) {
				$scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) + 1);
				$scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
				break;
			}
		}
		$scope.calcularTotales();
	};
	$scope.lineaChao = function(codigo) {
		for (var i = 0; i < $scope.cotLista.length ; i++) {
			if ($scope.cotLista[i].codigo == codigo) {
				//delete $scope.cotLista[i]; // incompatible
				$scope.cotLista.splice(i, 1); // borra i
				break;
			}
		}
		$scope.calcularTotales();
	};

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
      jQuery.post(app.restApi+"services/?action=validarInstalacion", {clave: $scope.user.password}, function(data) {
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
function Label(opt_options) {
    this.setValues(opt_options)
    //alert(this.get('offsetx'))
    //alert("values set")
    var myOffsety = this.get('offsety') ? this.get('offsety') : '-10px'
    var myOffsetx = this.get('offsetx') ? this.get('offsetx') : '-50%'
    	
    var span = this.span_ = document.createElement('span')
    span.style.cssText = 'position: relative; left:' + myOffsetx + '; top:' + myOffsety + '; ' +
    						'white-space: nowrap; color: #FFF;' +
    						'padding: 2px; font-family: Arial; font-weight: bold;' +
    						'font-size:12px'
    var div = this.div_ = document.createElement('div')
    div.appendChild(span)
    div.style.cssText = 'position: absolute; display: none;'
   // google.maps.event.addDomListener(span, 'click', function() {alert(name)})
    //alert("created")
}
      	
Label.prototype = new google.maps.OverlayView
      	
Label.prototype.onAdd = function() {
	var pane = this.getPanes().overlayImage;
    pane.appendChild(this.div_)
      		
    var me = this
    this.listeners_ = [
    	google.maps.event.addListener(this, 'position_changed', function() { me.draw() }),
      	google.maps.event.addListener(this, 'text_changed', function() { me.draw() }),
      	google.maps.event.addListener(this, 'zindex_chaged', function() {me.draw() })
      	]
}
      	
Label.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_)
      		
  	for(var i = 0, I = this.listeners_.length; i < I; i++)
    	google.maps.event.removeListener(this.listeners_[i])
      			
}
      	
Label.prototype.draw = function() {
	var projection = this.getProjection()
    var position = projection.fromLatLngToDivPixel(this.get('position'))
    var div = this.div_
    div.style.left = position.x + 'px'
    div.style.top = position.y + 'px'
    div.style.display = 'block'
    div.style.zIndex = this.get('zIndex')
    this.span_.innerHTML = this.get('text').toString()
}      
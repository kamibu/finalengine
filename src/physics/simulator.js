function PhysicsSimulator( sceneGraph ) {
    if ( typeof sceneGraph !== undefined ) {
        this.scene = sceneGraph;
    }
    this.collisionBehaviours = [];
}

PhysicsSimulator.prototype = {
    simulate : function( time ) {
        //old code
        /*
                var speed = 1/60;
        universe._updateState( ( Date.now() - loop.lastCall ) * speed, scene.world );
        loop.lastCall = Date.now();
        */
    },
    setCollisionBehaviour : function( type, callback ) {
        this.collisionBehaviours[ type ] = callback;
    }
};

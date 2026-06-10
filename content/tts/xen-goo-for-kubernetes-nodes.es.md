[matter-of-fact] En Kubernetes, un nodo contaminado suena a algo salido de Half-Life.

Casi puedes oír el aviso de Black Mesa:

[dramatic tone] Atención. Contaminación de Xen detectada.

Pero la idea es menos mística que el nombre. Un taint es una marca en un nodo que dice: no todos los pods son bienvenidos aquí.

Imagina un nodo del clúster cubierto de baba alienígena radiactiva. Los pods normales no deberían colocarse ahí. No tienen la protección adecuada. Pero un pod especial puede llevar el equivalente a un traje H E V: una toleration.

[deliberate] El taint dice:

Este lugar es peligroso, especial o reservado.

La toleration dice:

Lo sé. Puedo manejarlo.

[calm] Esa es la relación. El taint no atrae al pod. No es un imán. Se parece más a una etiqueta de advertencia, a un campo repelente o a un marcador de contaminación de Xen. Kubernetes mira el pod y pregunta: ¿esta carga de trabajo tolera esta condición?

Si la respuesta es sí, puede programarse ahí.

Si es no, se mantiene lejos.

Esa distinción importa. Si lo que quieres es "coloca este pod en nodos como estos", normalmente estás pensando en labels, selectors o affinity. Los taints y las tolerations tratan ante todo de exclusión. Protegen a los nodos de las cargas de trabajo ordinarias, a menos que esas cargas opten explícitamente por entrar.

[deadpan] Así que cuando alguien dice "los nodos están contaminados", yo oigo:

Black Mesa ha marcado estas máquinas como inseguras, especiales o reservadas. Solo los pods con el módulo de resistencia adecuado pueden entrar.

Lo cual resulta, de algún modo, muy de Kubernetes y muy de Half-Life.

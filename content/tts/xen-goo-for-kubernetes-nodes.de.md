[matter-of-fact] In Kubernetes klingt ein tainted node wie etwas aus Half-Life.

Man kann die Black-Mesa-Durchsage fast hören:

[dramatic tone] Warnung. Xen-Kontamination erkannt.

Aber die Idee ist weniger mystisch als der Name. Ein taint ist eine Markierung an einem Node, die sagt: Nicht jeder Pod darf hierher.

Stell dir einen Cluster-Node vor, bedeckt mit radioaktivem Alien-Schleim. Normale Pods sollten dort nicht platziert werden. Sie haben nicht den richtigen Schutz. Aber ein spezieller Pod kann so etwas wie einen HEV-Anzug tragen: eine toleration.

[deliberate] Der taint sagt:

Dieser Ort ist gefährlich, speziell oder reserviert.

Die toleration sagt:

Ich weiß. Ich komme damit klar.

[calm] Das ist die Beziehung. Der taint zieht den Pod nicht hinein. Er ist kein Magnet. Er ist eher ein Warnschild, ein Abwehrfeld oder eine Xen-Kontaminationsmarkierung. Kubernetes schaut sich den Pod an und fragt: Toleriert dieser Workload diese Bedingung?

Wenn ja, darf er dort eingeplant werden.

Wenn nein, bleibt er weg.

Diese Unterscheidung ist wichtig. Wenn du "diesen Pod auf solche Nodes setzen" willst, denkst du meistens an Labels, Selectors oder Affinity. Bei Taints und Tolerations geht es zuerst um Ausschluss. Sie schützen Nodes vor gewöhnlichen Workloads, außer diese Workloads melden sich ausdrücklich dafür an.

[deadpan] Wenn also jemand sagt: "the nodes are tainted", höre ich:

Black Mesa hat diese Maschinen als unsicher, speziell oder reserviert markiert. Nur Pods mit dem richtigen Resistenzmodul dürfen eintreten.

Was irgendwie zugleich sehr Kubernetes und sehr Half-Life ist.

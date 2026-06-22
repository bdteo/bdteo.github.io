[matter-of-fact] Ядрената опция за масови изтривания: трънкейт и повторно вмъкване в MySQL и InnoDB.

Трябва да изтриеш милиони редове от MySQL таблица.

Първият честен импулс е прост: дилийт от голямата таблица, където редът е по-стар от cutoff-а.

После заявката върви достатъчно дълго, за да се превърнеш в друг човек.

Затова правиш отговорното нещо. Триеш по десет хиляди реда. Подреждаш по id. Повтаряш, докато свърши. Добавяш пауза. Гледаш репликите. Надяваш се историята със заключванията да остане скучна.

Това често е правилният отговор.

[flatly] Но ако изтриваш по-голямата част от таблицата, изтриването ред по ред не е благородно. Просто е скъпо.

Има друг ход: не изтривай това, което не искаш. Запази това, което искаш, възстанови таблицата, и продължи.

Това е ядрената опция: копирай редовете за запазване, направи трънкейт на таблицата, после вмъкни тези редове обратно.

Тя е бърза, защото сменя единицата работа. Спираш да плащаш за всеки изтрит ред и започваш да плащаш за всеки запазен ред.

[deliberate] Също така е опасна, защото трънкейт не е учтив дилийт. В MySQL има D D L характер. Прави имплицитен комит. Нулира auto increment. Не задейства on-delete trigger-и. Има реални последици за foreign keys и replication.

Точно затова заслужава истински runbook, не умно фрагментче, залепено в production в два сутринта.

Ето формата на решението.

Обикновен дилийт е най-добър, когато триеш малък, индексиран отрязък. Обикновено може да върви онлайн и може да бъде transactional, ако транзакцията е разумна. Но при огромни множества плащаш за всеки засегнат index, undo log, redo log и binlog запис.

Пакетен дилийт е най-добър, когато ти трябва темпо за жива система и можеш да понесеш по-дълга задача. Всеки batch може да се комитва самостоятелно. Можеш да спреш и да продължиш. Но пак е ред по ред, и пак може да направи replica lag.

Drop или truncate на partition е най-добър, когато редовете пасват чисто на цели partitions. Това е порасналата версия на retention cleanup. Уловката е, че partition boundary трябва да съвпада с правилото. Границите не прощават оптимизъм.

Table swap е полезен, когато можеш да построиш replacement table и атомарно да я преименуваш на място. Swap прозорецът е кратък, но copy фазата пак иска план за writes, triggers, grants, foreign keys и application assumptions.

А трънкейт плюс повторно вмъкване е най-добър, когато изтриваш почти всичко и можеш да спреш writes. Таблицата е празна между truncate и restore, а rollback историята не е приятелска.

[reflective] Моето практическо правило е това: ако триеш под петдесет процента, започни с indexed delete или batched delete. Ако триеш между петдесет и осемдесет процента, измери batched delete срещу rebuild подходи. Ако триеш над осемдесет процента, сериозно мисли за preserve-and-rebuild.

Процентът не е магия. Тридесет процента delete от таблица с ужасни indexes пак може да боли. Деветдесет процента delete от малка таблица може да не заслужава церемония.

Истинският въпрос е: коя страна на данните е по-малка и по-безопасна за работа?

Защо масовият дилийт боли в InnoDB?

Защото InnoDB не поглежда твоя where clause, не въздиша мечтателно и не маха range от байтове от диска.

Той трябва да намери редовете през index, или да сканира прекалено много. Трябва да заключва records, а понякога и gaps, по сканираните index ranges. Трябва да поддържа всеки засегнат secondary index. Пише undo, за да може delete-ът да се rollback-не. Пише redo, за да работи crash recovery. Пише binary logs, за да има история за replication и recovery. И оставя purge работа, която InnoDB да почисти, след като старите versions вече не са видими.

[matter-of-fact] Неприятната подробност е, че delete заключва index records, които сканира, не само редовете, за които мисловният ти модел вярва, че са съвпаднали.

Пакетните deletes намаляват blast radius, като правят всяка transaction по-малка. Изтрий ограничен брой редове преди cutoff-а, подредени по id, после повтори. Това дава време на репликите да дишат. Позволява ти да спреш. Не позволява undo да стане една огромна transaction.

Но не сменя основния cost model. Все още изтриваш ред по ред.

Трънкейт сменя модела, защото MySQL третира truncate table повече като drop и recreate на таблицата, отколкото като изтриване на всеки ред. Той заобикаля нормалния D M L delete path, причинява имплицитен commit, не може да се rollback-не като нормален D M L statement и не задейства on-delete triggers.

Затова вместо да изтриеш осемдесет милиона реда и да запазиш двадесет милиона, копираш двадесет милиона реда, изпразваш таблицата бързо и вмъкваш двадесет милиона реда обратно.

[deadpan] Това е целият номер. Implementation details са мястото, където са заровени мините.

Най-безопасната версия започва с keep set-а.

Не: изтрий всичко по-старо от X.

А: след тази операция таблицата съдържа точно редовете, които съвпадат с Y.

Тази рамка има значение, защото запазените редове стават твоята recovery anchor.

Замрази променливите стойности, преди да мериш. Ако cutoff-ът е първи януари, задай го веднъж и използвай точно тази стойност. После преброй total rows, keep rows и delete rows в една preflight заявка.

След това провери access path-а. Пусни explain на заявката, която намира редовете за запазване. Ако MySQL трябва да прави full table scan върху таблица, която още приема writes, спри и проектирайте maintenance window както трябва. Ядрената опция не е заместител на това да знаеш как се достъпва таблицата.

[deliberate] Преди да пипам production, искам пет проверки.

Първо, потвърди foreign-key връзките. Намери child tables, които реферират таблицата, която искаш да изпразниш. Ако други таблици я реферират, не изключвай лекомислено foreign key checks с надежда. MySQL не валидира съществуващите редове, когато ги включиш обратно. Това е полезно за контролирани reloads. Като махане с ръка е ужасяващо.

Второ, провери triggers. Ако delete triggers пишат audit rows, чистят caches, обновяват rollups или уведомяват други systems, truncate ги заобикаля. Това е или точно каквото искаш, или точно как създаваш много тих incident.

Трето, провери disk space. Трябва ти място за запазените редове някъде. Ако пазиш двадесет процента от петстотин гигабайта таблица, временната copy е реален object, който се състезава за реален disk и I O.

Четвърто, провери binary logs и replicas. Truncate се log-ва за replication като statement, а reinsert-ът пак е голям write. Това може да е много по-добре от logging на милиони row deletes, но не е безплатно.

Пето, имай restore path, който наистина си тествал. "Имаме backups" не е restore plan. Знай кой backup ще restore-неш, къде ще го restore-неш и как ще извлечеш само тази таблица, ако резултатът е грешен.

Ето практическият runbook.

Приеми, че таблицата може безопасно да бъде празна за кратко: няма child tables, които зависят от тези редове по време на операцията, writes са спрени или application-ът е в maintenance mode, keep condition-ът е frozen, backups са реални, и replicas са обмислени.

Използвай explicit columns. Знам, че select star изглежда чисто. Това е и начинът generated columns, invisible columns, drift в column order и бъдещи migrations да направят нощта ти по-интересна.

Създай keep table със същата structure като source table. Използвай create table like, не create table as select. Вмъкни редовете, които искаш да запазиш, в тази keep table, като назовеш всяка колона explicit и използваш frozen cutoff-а.

После преброй запазената copy, преди да направиш нещо irreversible.

След това идва точката, от която няма леко връщане: truncate на оригиналната таблица.

Върни запазените редове обратно в оригиналната таблица с explicit column list. Освежи optimizer statistics. После провери final row count, най-стария оставащ ред и table status преди cleanup.

[reflective] Drop-ни запазената copy само след като application-ът е обратно, counts съвпадат и си погледнал реалното product behavior, което зависи от тази таблица.

Тази запазена таблица не е clutter по време на операцията. Тя е въжето.

Има и table-swap вариант, когато прозорецът с празна таблица е неприемлив.

Формата е подобна: създай new table like old table, вмъкни редовете, които искаш, в new table, после атомарно преименувай old table настрани и new table на нейно място.

Самият rename е atomic. Други sessions не виждат полу-преименувана двойка. Но не бъркай това със zero downtime.

Ако старата таблица получава writes, докато новата се попълва, тези writes не се копират магически. Трябва ти write pause, delta-capture plan или нарочно по-сложна online migration.

Също така create table like копира column attributes и indexes, но не прави всеки околен object безопасен. Провери triggers, foreign keys, grants, partitioning, generated columns и application assumptions. Името на таблицата може да оцелее при swap-а. Operational context-ът може да не оцелее.

Ако редовете съвпадат с partitions, partitioning често е най-чистият отговор. Drop-ни old partition, или truncate-ни old partition, и продължи.

[matter-of-fact] Това е порасналата версия на bulk deletion: проектирайте таблицата така, че старите данни да излизат през врата, не през шредер.

Уловката е очевидна и пак боли. Partition boundary трябва да съвпада с retention rule. Ако cleanup condition-ът е: изтрий всеки completed task за customers on the old billing plan, освен тези с unresolved exports, partitioning няма да те спаси.

Сега капаните, директно.

Truncate commit-ва имплицитно. Create table, alter table, drop table и rename table живеят в същия implicit-commit свят. Да увиеш runbook-а в start transaction не го прави безопасно обратим. Ако планът ти зависи от "ще rollback-нем, ако изглежда грешно", нямаш план.

Foreign keys не са checkbox. Ако таблицата е parent, child rows другаде може да зависят от нея. Ако таблицата е child, редът на reinsert има значение. Ако изключиш foreign key checks, MySQL няма да валидира старите редове, когато ги включиш обратно.

On-delete triggers не се задействат. Това може да е performance benefit. Може и да заобиколи audit trails и denormalized counters.

Auto increment се нулира. Ако reinsert-неш explicit ids, MySQL често advance-ва next value, докато вижда тези ids, но аз пак го проверявам. Прочети maximum id. Провери table status. Ако следващата auto increment стойност е грешна, поправи я умишлено. Не гадай числото.

Create table as select не е същото като create table like. Първото е удобно, но не създава автоматично indexes за новата таблица, и някои attributes не се preserve-ват както хората предполагат. За operational runbook предпочитам create table like, после insert с explicit columns.

Constraints все още имат значение след truncate. Ако preserved set-ът се произвежда чрез joins, deduping, transformations или code, валидирай го преди truncate. "Би трябвало да е наред" не е verification strategy.

Replicas пак могат да изостанат. Този метод може да намали работата спрямо огромен row-by-row delete, но replicas пак трябва да приложат truncate и bulk insert. Гледай ги.

[emphasized] И application-ът не трябва да пише през copy прозореца.

Ако копираш keep rows в два часа и application-ът insert-не нови валидни редове пет секунди по-късно, тези редове не са в keep table. По-късен truncate ги маха.

Maintenance mode не е само за user experience. Той е data correctness.

Предупреждение в Laravel контекст: важното не е facade-ът. Важна е границата.

Не крий това в generic helper, който приема arbitrary table names и raw where strings. Identifiers трябва да са code constants. Keep condition-ът трябва да идва от reviewed code, не от user input. И database transactions не правят D D L rollback-safe в MySQL.

Skeleton-ът, на който вярвам, прилича повече на command, отколкото на reusable library function. Създай keep table. Insert-ни preserved rows с bound cutoff. Преброй keep rows. Log-ни числото. Сравни го с preflight count-а. Изискай explicit operator confirmation. После truncate и restore.

[deadpan] Тази confirmation step не е театър. Това е паузата, в която хващаш: чакай, keep rows е единадесет, не единадесет милиона.

Ето малкият checklist за два сутринта.

Преди: знам точния keep condition. Замразих всеки time-based cutoff. Преброих total, keep и delete rows. Проверих foreign keys и triggers. Проверих disk space. Знам backup и restore path-а. Проверих replica lag и binlog implications. Спрях writes или имам истински delta-capture plan.

По време: създавам keep table. Преброявам я. Сравнявам count-а с preflight числото. Пускам irreversible step-а само след като числата имат смисъл. Вмъквам обратно с explicit columns. Пускам analyze и проверявам.

След: final row count съвпада с keep count. Boundary rows изглеждат правилно. Application behavior е проверено, не само SQL output. Replicas са caught up или умишлено catching up. Keep table остава, докато вече не ми трябва въжето.

Не бих използвал truncate плюс reinsert, ако таблицата има важни delete triggers, ако foreign-key cascades са правилното business behavior, ако writes не могат да бъдат спрени, ако keep condition-ът е размит, ако delete-ът е достатъчно малък за batched delete, ако таблицата вече е partitioned по retention boundary, или ако организацията не може да restore-не таблицата, когато runbook-ът е грешен.

Последното е тестът. Ако restore на таблицата би бил хаос, не избирай операция, чийто failure mode е: restore-ни таблицата.

[reflective] Ядрената опция не е хитра, защото truncate е бърз. Всички знаят, че truncate е бърз.

Полезната идея е да решиш каква работа искаш database-ът да свърши.

Ако изтриваш почти всичко, да караш InnoDB внимателно да изтрие почти всичко може да е погрешната добрина. Запази важното. Построй наново около него. Проверявай така, сякаш умореното ти бъдещо аз ще чете output-а с едно отворено око.

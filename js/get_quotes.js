function get_quotes () {
    (async () => {
        $("#question-card-list").empty()
        $(".loading-question").show();

		
		/*let query =
			{
			    op: 'and',
			    expr1:
					{
					op: 'and',
					expr1:
						{
							op: 'equals',
							expr1: 'App-Name',
							expr2: 'PlayQuote'
						},
					expr2: 
						{
							op: 'equals',
							expr1: 'App-Version',
							expr2: versionNumber,
						}
					},
			    expr2:
					{
						op: 'equals',
						expr1: 'partID',
						expr2: '3',
                    }
			}
			*/
		
		
        let query =
			{
			    
				op: 'and',
				expr1:
					{
						op: 'equals',
						expr1: 'App-Name',
						expr2: 'PlayQuote'
					},
				expr2: 
					{
						op: 'equals',
						expr1: 'App-Version',
						expr2: versionNumber,
					}
			}

    	const res = await this.arweave.api.post(`arql`, query)
        var tx_rows = []
        if (res.data == '') {
            tx_rows = []
        } else {
		    tx_rows = await Promise.all(res.data.map(async function (id, i) {
                let tx_row = {}
                var tx = await this.arweave.transactions.get(id)

                tx_row['unixTime'] = '0'
                tx.get('tags').forEach(tag => {
                    let key = tag.get('name', { decode: true, string: true })
                    let value = tag.get('value', { decode: true, string: true })
                    if (key === 'Unix-Time') tx_row['unixTime'] = value
                })

                var jsonData = tx.get('data', {decode: true, string: true})
                var data = JSON.parse(jsonData);

                tx_row['Quote-ID'] = id
                tx_row['from'] = await get_name(await arweave.wallets.ownerToAddress(tx.owner))
                tx_row['line1'] = data["line1"]
				tx_row['line2'] = data["line2"]
				tx_row['line3'] = data["line3"]
				

				console.log(data)
                return tx_row
            }))
        }

        $(".loading-question").hide();
        tx_rows.sort((a, b) => (Number(b.unixTime) - Number(a.unixTime)))
		var question_card0 = $("#question-card-template0").html()
            question_card0 = question_card0.replace("\[id\]", tx_rows[0]['Quote-ID']);
            question_card0 = question_card0.replace("\[line1\]", tx_rows[0]['line1']);
			question_card0 = question_card0.replace("\[line2\]", tx_rows[0]['line2']);
			question_card0 = question_card0.replace("\[line3\]", tx_rows[0]['line3']);
			$("#question-card-list0").append(question_card0);
        tx_rows.forEach(function (item) {
			if(item["line3"]!=''){
            var question_card = $("#question-card-template").html()

            var datetime = new Date(item["unixTime"]*1000);
            var date_options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            var formatted_datetime = datetime.toLocaleDateString('default', date_options)

            question_card = question_card.replace("\[id\]", item["Quote-ID"]);
            question_card = question_card.replace("\[author\]", item["from"]);
            question_card = question_card.replace("\[datetime\]", formatted_datetime);
            question_card = question_card.replace("\[line1\]", item["line1"]);
			question_card = question_card.replace("\[line2\]", item["line2"]);
			question_card = question_card.replace("\[line3\]", item["line3"]);
            question_card = question_card.replace("\[description\]", item["line3"]);
			
			
			
			
            $("#question-card-list").append(question_card);
			}
        })

        mark_owned_questions()
    })()
}

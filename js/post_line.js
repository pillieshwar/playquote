function post_line () {
    (async () => {
		
		
		
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

                tx_row['from'] = await get_name(await arweave.wallets.ownerToAddress(tx.owner))
                tx_row['line1'] = data["line1"]
                tx_row['line2'] = data["line2"]
				tx_row['line3'] = data["line3"]
				tx_row['QuoteID'] = data["QuoteID"]
				
				return tx_row
            }))
        }

        tx_rows.sort((a, b) => (Number(b.unixTime) - Number(a.unixTime)))
		
		
		/* var QuoteID = 0
		var line1 = 'Key to success in life is'
		var line2 = 'dicipline,hard-work,consistency'
		var line3 = 'and a never giving up spirit' 
		var partID = 0;*/
		
		var QuoteID = (tx_rows[0]['QuoteID'] + 1)
		var line1 = tx_rows[0]['line1']
		var line2 = tx_rows[0]['line2']
		var line3 = tx_rows[0]['line3']
		var partID = 0;
				
		console.log("-------------------->>>>>>>>>>"+tx_rows[0]['line1'])
		console.log("-------------------->>>>>>>>>>"+tx_rows[0]['line2'])
		console.log("-------------------->>>>>>>>>>"+tx_rows[0]['line3'])
	
	
		if(line1=='')
		{
			line1 = $("#input_question").val();
			partID = 1;
		}else
		if(line2=='')
		{
			line2 = $("#input_question").val();
			partID = 2;
		}else
		if(line3=='')
		{
			line3 = $("#input_question").val();
			partID = 3;
		}else
		{
			line1 = $("#input_question").val();
			line2 = '';
			line3 = '';
			partID = 0;
		}
		
		
		
        if (!$("#question-form").valid() || $("#question-btn").hasClass("disabled")) return;
        $("#question-btn").addClass("disabled").addClass("wait");

        var question = $("#input_question").val();
        var description = $("#input_description").val();

        var unixTime = Math.round((new Date()).getTime() / 1000)

        var data = {
			'QuoteID' : QuoteID,
            'line1': line1,
            'line2': line2,
			'line3': line3,
			'partID': partID
        }

	
	var fee = 0.05   //minimum fee to prevent spam
        var tx =
			await arweave.createTransaction(
			    {
			        data: JSON.stringify(data),
				target: 'xquVrUMBzjH5Gqn-IkBvN34Aw8NqWnGTPlV7GGQUegM',
				quantity: arweave.ar.arToWinston(fee),
			    },
			    wallet
			)

        tx.addTag('App-Name', 'PlayQuote')
        tx.addTag('App-Version', versionNumber)
        tx.addTag('Unix-Time', unixTime)
        tx.addTag('QuoteID', QuoteID)
		tx.addTag('partID', partID)
        await arweave.transactions.sign(tx, wallet)
        console.log(tx.id)
        await arweave.transactions.post(tx)
        alert('By the time your Quote is being written to the Blockchain, you can have a look at some of the Quotes')
        
        $('#askQuestionModal').modal('hide');
        $("#input_question").val('');
        $("#input_description").val('');
        $("#question-btn").removeClass("disabled").removeClass("wait");
    })()
}

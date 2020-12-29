return {
                
	'template': function(template, expressionTypes, bindingTypes, getComponent) {
			return template(`
			<div class="header">
			<img src="logo.jpg"/><div class="name">Dynamic Set Dollar</div>
			<div class="links"><a href="http://dsd.finance/" target="_blank">dao</a>
			<a href="https://info.uniswap.org/token/0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3" target="_blank">trade</a></div>
			<div class="clear"></div></div>
			
			<div class="hero">
			<a href="https://updown.finance" target="_blank" class="updown">BET ON TWAP OUTCOME</a>
			
			<div class="next">Next Epoch:</div>
			<div expr0="expr0"></div>
			<div expr3="expr3"></div>
			<div expr6="expr6"></div>
			</div>
			
			</table></div><div class="clear"></div>`, 
			[
				{
					'type': bindingTypes.IF,

					'evaluate': function(scope) {
							return scope.state.price.twap > 1 && scope.state.supply.coupons > 10000;
					},

					'redundantAttribute': 'expr3',
					'selector': '[expr3]',

					'template': template('<div expr4="expr4" class="main"> </div><div expr5="expr5" class="sub-main"> </div>', [{
							'redundantAttribute': 'expr4',
							'selector': '[expr4]',

							'expressions': [{
									'type': expressionTypes.TEXT,
									'childNodeIndex': 0,

									'evaluate': function(scope) {
											return [Math.round(scope.state.advance.supplyDiff * 0.6).toLocaleString('fullwide', {
													useGrouping: true
											}), ' DSD will be redeemable by coupons'].join('');
									}
							}]
					}, {
							'redundantAttribute': 'expr5',
							'selector': '[expr5]',

							'expressions': [{
									'type': expressionTypes.TEXT,
									'childNodeIndex': 0,

									'evaluate': function(scope) {
											return ['Yielding ', scope.state.advance.lpPct, '% on LPd DSD (', scope.state.advance.lpARP, '% ARP)'].join('');
									}
							}]
					}])
			}, 
			
			{
					'type': bindingTypes.IF,

					'evaluate': function(scope) {
							return scope.state.price.twap < 1;
					},

					'redundantAttribute': 'expr6',
					'selector': '[expr6]',

					'template': template('<div expr7="expr7" class="main"> </div>', [{
							'redundantAttribute': 'expr7',
							'selector': '[expr7]',

							'expressions': [{
									'type': expressionTypes.TEXT,
									'childNodeIndex': 0,

									'evaluate': function(scope) {
											return ['Protocol debt will increase by ', scope.state.advance.supplyDiff.toLocaleString('fullwide', {
													useGrouping: true
											}), ' DSD'].join('');
									}
							}]
					}])
			}, 
			
			
			
			
			
			
			 						
		
		]);
	},

	'name': 'app'
};
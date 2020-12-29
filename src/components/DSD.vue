<template>
  <div class="hello">
    <h1>Dynamic Set Dollar</h1>

		
		<div v-if="parseFloat(state.price.twap) > 1 && parseFloat(state.supply.coupons) < 10000" class="message">
			<p>
				Total supply will increase by {{state.advance.supplyDiff}} DSD
			</p>
			<p>
				Yielding  {{state.advance.lpPct}}% on LPd DSD ({{state.advance.lpARP}}% ARP) and {{state.advance.daoPct}}% to bonded DSD ({{state.advance.daoARP}}% ARP)
			</p>
		</div>
		
		<div v-if="parseFloat(state.price.twap) > 1 && parseFloat(state.supply.coupons) > 10000"  class="message">
			<p>
				{{Math.round(parseFloat(state.advance.supplyDiff) * 0.6)}} DSD will be redeemable by coupons
			</p>
			<p>
				Yielding {{state.advance.lpPct}}% on LPd DSD ({{state.advance.lpARP}}% ARP)
			</p>
		</div>

		<div v-if="parseFloat(state.price.twap) < 1"  class="message">
			<p>
				Protocol debt will increase by {{state.advance.supplyDiff}} DSD
			</p>
		</div>		
		
		<table>			
			<tr>
				<td>Next epoch:</td>
				<td>{{state.nextEpoch}}</td>
			</tr>
			<tr>
				<td>Epoch:</td>
				<td>{{state.epoch}}</td>
			</tr>
			<tr>
				<td>Spot Price:</td>
				<td>{{state.price.spot}}</td>
			</tr>
			<tr>
				<td>TWAP Price:</td>
				<td>{{state.price.twap}}</td>
			</tr>			
			<tr>
				<td>Market cap:</td>
				<td>${{state.mCap}}</td>
			</tr>
			<tr>
				<td>Tokens:</td>
				<td>{{state.supply.tokens}}</td>
			</tr>
			<tr>
				<td>Coupons:</td>
				<td>{{state.supply.coupons}}</td>
			</tr>
			<tr>
				<td>Total Supply:</td>
				<td>{{state.supply.total}}</td>
			</tr>
			<tr>
				<td>LP Staged:</td>
				<td>{{state.lp.staged}} %</td>
			</tr>
			<tr>
				<td>LP Bonded:</td>
				<td>{{state.lp.bonded}} %</td>
			</tr>
			<tr>
				<td>DAO Staged:</td>
				<td>{{state.dao.staged}} %</td>
			</tr>
			<tr>
				<td>DAO Bonded:</td>
				<td>{{state.dao.bonded}} %</td>
			</tr>
		</table>
		
		
			<p>DSD</p>
			<table>	
				<tr>
					<td>Wallet:</td>
					<td>{{state.user.tokens.wallet}}</td>
				</tr>
				<tr>
					<td>Staged:</td>
					<td>{{state.user.tokens.staged}}</td>
				</tr>
				<tr>
					<td>Bonded:</td>
					<td>{{state.user.tokens.bonded}}</td>
				</tr>
			</table>
		
		
		
			<p>DSD-USDC LP</p>
			<table>	
				<tr>
					<td>Wallet:</td>
					<td>{{state.user.lp.wallet}} LP</td>
				</tr>
				<tr>
					<td>Staged:</td>
					<td>{{state.user.lp.staged}} LP</td>
				</tr>
				<tr>
					<td>Bonded:</td>
					<td>{{state.user.lp.bonded}} LP</td>
				</tr>
			</table>
		
    
  </div>
</template>

<script>
import Web3 from 'web3';
import BigNumber  from 'bignumber.js';
import dsd from './dsd.js';

export default {
  name: 'DSD',  
  data () {      
    return {
			config: dsd.config,
			contracts: dsd.contracts,
			state:{
				price: {
					spot: "...",
					twap: "...",
				},
				epoch: "...",
				supply: {
					tokens: "...",
					coupons: "...",
					total: "...",
				},
				user: {
					tokens: {
						wallet: '...',
						staged: '...',
						bonded: '...',
					},
					lp: {
						wallet: '...',
						staged: '...',
						bonded: '...',
					}
				},
				lp: {
					staged: "...",
					bonded: "...",
				},
				dao: {
					staged: "...",
					bonded: "...",
				},
				mCap: "...",
				advance: {
					supplyDiff: "...",
					lpPct: "...",
					daoPct: "...",
					lpARP: "...",
					daoARP: "...",
				},
				wallet: {
					tokens: "...",
					tokensPct: "...",
					lp: "...",
					lpPct: "...",
				},
				defaultAddress: undefined,	
				nextEpoch: "...",
			},
			web3: undefined,      
    };
  },
  computed: {
    walletDisconnected() { 
			console.log('walletDisconnected')
			return typeof this.state.defaultAddress === undefined 
		}, 
  },
  mounted() {
		console.log('mounted')   
		this.initWeb3();
		this.calculateTimer();    
  },
  methods: { 
    initWeb3() {				
			if (typeof ethereum !== 'undefined') {
				this.web3 = new Web3(ethereum);
				this.connectWallet();
				ethereum.on("accountsChanged", (accountsChangedResult) => {							
          this.updateDefaultAddress();
        });
			} else {
				this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.defaultUrl));
			}			
      this.updateDefaultAddress();
    },
    async connectWallet() {
			typeof window.ethereum !== undefined &&
				(await ethereum.enable().catch((error) => {
					console.error(error);
				}));
    },
    updateDefaultAddress() {				
			this.web3.eth.getAccounts().then((getAccountsResult) => {					
				this.state.defaultAddress = getAccountsResult[0];
				this.state.defaultAddress = this.state.defaultAddress == undefined ? '0x0000000000000000000000000000000000000000' : this.state.defaultAddress,

				console.log('defaultAddress', this.state.defaultAddress)
				this.updateAllStats();
			});
    },
    erc20Contract(address) {				
			return this.getContract(this.config.erc20Abi, address);
		},
		dsdsContract() {
			return this.getContract(this.config.dsdsAbi, this.contracts.dsds);
		},
		lpContract() {
			return this.getContract(this.config.lpAbi, this.contracts.lp);
		},
		uniswapContract() {
			return this.getContract(this.config.uniswapAbi, this.contracts.uniswap);
		},
		getContract(abi, address) {
			return new this.web3.eth.Contract(abi, address);
    },
    moneyFormat(input) {
			return Math.abs(Number(input)) >= 1000000000
				? Math.abs(Number(input)) / 1000000000 + "B"
				: Math.abs(Number(input)) >= 1000000
				? Math.abs(Number(input)) / 1000000 + "M"
				: Math.abs(Number(input)) >= 1000
				? Math.abs(Number(input)) / 1000 + "k"
				: Math.abs(Number(input));
    },
    calculateTimer() {
			let val = 3600 * 2 - (Math.round(Date.now() / 1000) % (3600 * 2));
			this.startTimer(val); 
		},
    startTimer(timeLeftInput) {
			let self = this
			setInterval(function () {
				let timeLeft = timeLeftInput
				let hours = Math.floor(timeLeft / 3600);
				
				timeLeft %= 3600;
				
				let minutes = Math.floor(timeLeft / 60)
				let seconds = timeLeft % 60;
				
				hours = hours < 10 ? "0" + hours : hours;
				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;
				
				self.state.nextEpoch = (hours + ":" + minutes + ":" + seconds);
				
				--timeLeftInput < 0 && (timeLeftInput = 0);					
			}, 1000);
    },
    round(value, limit) {				
			return +(Math.round(value + ("e+" + limit)) + ("e-" + limit));
		},

		async updateAllStats() {		
			// .toLocaleString('fullwide', { useGrouping: true })	
			let usdcBalance = await this.erc20Contract(this.contracts.usdc).methods.balanceOf(this.contracts.uniswap).call()

			let dsdBalance = await this.erc20Contract(this.contracts.dsd).methods.balanceOf(this.contracts.uniswap).call()
			
			this.state.price.spot = this.round(usdcBalance / 10 ** 6 / (dsdBalance / 10 ** 18), 4);
					
			this.state.epoch = await this.dsdsContract().methods.epoch().call()	
			
			let dsdTotalSupply = await this.erc20Contract(this.contracts.dsd).methods.totalSupply().call()

			this.state.supply.tokens = this.round(dsdTotalSupply / 10 ** 18, 2)//.toLocaleString("fullwide", {	useGrouping: !![],	});
										
			let uniswapTotalSupply = await this.erc20Contract(this.contracts.uniswap).methods.totalSupply().call()
					
			let dsdsTotalCoupons = await this.dsdsContract().methods.totalCoupons().call()

			this.state.supply.coupons = this.round(dsdsTotalCoupons / 10 ** 18, 2); //.toLocaleString("fullwide", {	useGrouping: !![],	})
			this.state.supply.total = this.round((parseInt(dsdTotalSupply) + parseInt(dsdsTotalCoupons)) / 10 ** 18, 2)//.toLocaleString("fullwide", { useGrouping: !![], } );
									
			let dsdDefaultAddressBalance = await this.erc20Contract(this.contracts.dsd).methods.balanceOf(this.state.defaultAddress).call()			

			this.state.user.tokens.wallet = this.round(dsdDefaultAddressBalance / 10 ** 18, 2)//.toLocaleString("fullwide", {	useGrouping: !![],	});

			let dsdsContractBalanceOfStaged = await this.dsdsContract().methods.balanceOfStaged(this.state.defaultAddress).call();
			this.state.user.tokens.staged = this.round(dsdsContractBalanceOfStaged / 10 ** 18, 2)//.toLocaleString('fullwide', { 'useGrouping': !![] });

			let dsdsContractBalanceOfBonded = await this.dsdsContract().methods.balanceOfBonded(this.state.defaultAddress).call();
			this.state.user.tokens.bonded = this.round(dsdsContractBalanceOfBonded / 10 ** 18, 2)//.toLocaleString('fullwide', { 'useGrouping': !![] });

			let uniswapBalanceOfDefaultAddress = await this.erc20Contract(this.contracts.uniswap).methods.balanceOf(this.state.defaultAddress).call();
			this.state.user.lp.wallet = this.round(uniswapBalanceOfDefaultAddress / 10 ** 18, 8);
			this.state.user.lp.wallet = isNaN(this.state.user.lp.wallet) ? 0 : this.state.user.lp.wallet;

			let lpContractBalanceOfStaged = await this.lpContract().methods.balanceOfStaged(this.state.defaultAddress).call();
			this.state.user.lp.staged = this.round(lpContractBalanceOfStaged / 10 ** 10, 8);

			let lpContractBalanceOfBonded = await this.lpContract().methods.balanceOfBonded(this.state.defaultAddress).call();
			this.state.user.lp.bonded = this.round(lpContractBalanceOfBonded / 10 ** 10, 8);

			let lpContractTotalStaged = await this.lpContract().methods.totalStaged().call();
			let lpContractTotalBonded = await this.lpContract().methods.totalBonded().call();
			
			this.state.lp.bonded = this.round((parseInt(lpContractTotalBonded) / parseInt(uniswapTotalSupply)) * 100, 2)//.toLocaleString("fullwide", {	useGrouping: !![],	});
			this.state.lp.staged = this.round((parseInt(lpContractTotalStaged) / parseInt(uniswapTotalSupply)) * 100, 2)//.toLocaleString("fullwide", {	useGrouping: !![],  });

			let dsdsContractTotalStaged = await this.dsdsContract().methods.totalStaged().call()			
			let dsdsContractTotalBonded = await this.dsdsContract().methods.totalBonded().call()

			this.state.dao.bonded = this.round((parseInt(dsdsContractTotalBonded) / parseInt(dsdTotalSupply)) * 100, 2)//.toLocaleString("fullwide", {	useGrouping: !![],	});
			this.state.dao.staged = this.round((parseInt(dsdsContractTotalStaged) / parseInt(dsdTotalSupply)) * 100, 2)//.toLocaleString("fullwide", {	useGrouping: !![],	});

			this.state.mCap = this.moneyFormat(this.round((this.state.price.spot * dsdTotalSupply) / 10 ** 18, 0));
			this.state.mCap = parseFloat(this.state.mCap).toPrecision(3) + this.state.mCap.replace(/[^B|M|k]/g, "");

			this.loadTWAP(dsdTotalSupply, uniswapTotalSupply, lpContractTotalBonded, dsdBalance, dsdsContractTotalBonded);			
		},

		async loadTWAP(dsdTotalSupply, uniswapTotalSupply, lpContractTotalBonded, dsdBalance, dsdsContractTotalBonded) {
			let state = this.state;
			let self = this;
			self.web3.eth.getStorageAt('0xe2E279d1b911baD880d1104A750dFCD262Fb6Cf4', 4, async function(address4, position4result) {				
				let position4 = parseInt(position4result, 16);								
				self.web3.eth.getStorageAt('0xe2E279d1b911baD880d1104A750dFCD262Fb6Cf4', 5, async function(address5, position5result) {					
					let position5 = parseInt(position5result, 16);
					
					let uniswapContractPrice1CumulativeLastResult = await self.uniswapContract().methods.price1CumulativeLast().call()					
					let uniswapContractReservesResults = await	self.uniswapContract().methods.getReserves().call()

					let uniswapContractReserves = parseInt(uniswapContractReservesResults['_blockTimestampLast']);

					const position4BN = new BigNumber(position4);
					
					let uniswapContractPrice1CumulativeLastResultBN = new BigNumber(uniswapContractPrice1CumulativeLastResult);

					const uniswapContractReservesPosition5Diff = uniswapContractReserves - position5;
					if (parseInt(uniswapContractReservesPosition5Diff) === 0)	return 0;
					
					let _0x2b7dd6 = (uniswapContractPrice1CumulativeLastResultBN - position4BN) / uniswapContractReservesPosition5Diff;
					let _0x362947 = 1000000000000 * 10 ** 18;
					let _0x5eee4e = _0x2b7dd6 * _0x362947 / new BigNumber(2).pow(112);
					self.state.price.twap = self.round(parseFloat(_0x5eee4e) / 10 ** 18, 2);
												
					let dsdsContractBootstrappingAtResult = await	self.dsdsContract().methods.bootstrappingAt(parseInt(state.epoch) + 1).call()
					
					
					if (dsdsContractBootstrappingAtResult)
						state.advance.supplyDiff = self.round(parseInt(dsdTotalSupply) * 0.045 / 10 ** 18, 0);
					else {
						let _0x1c8cfe
						if (self.state.price.twap > 1) {
							 _0x1c8cfe = (self.state.price.twap - 1) / 12;
						}	else {
							_0x1c8cfe = 1 - self.state.price.twap;
							_0x1c8cfe = _0x1c8cfe > 0.1 ? 0.1 : _0x1c8cfe;
						}
						state.advance.supplyDiff = self.round(parseInt(dsdTotalSupply) / 10 ** 18 * _0x1c8cfe, 0);
					}
								
					let _0x2bd793, _0x24a228;
					state.supply.coupons > 0 ? (
							_0x2bd793 = Math.round(state.advance.supplyDiff * 0.4),					
							_0x24a228 = Math.round(state.advance.supplyDiff * 0.6)
						) : (
							_0x2bd793 = Math.round(state.advance.supplyDiff * 0.4),	
							_0x24a228 = 0
						);		
						
					let _0x5be814 = parseInt(lpContractTotalBonded) / parseInt(uniswapTotalSupply) * (parseInt(dsdBalance) / 10 ** 18);

					state.advance.lpPct = self.round(_0x2bd793 / parseInt(_0x5be814) * 100, 2)//.toLocaleString("fullwide", {'useGrouping': !![] });
					state.advance.daoPct = self.round(_0x24a228 / (parseInt(dsdsContractTotalBonded) / 10 ** 18) * 100, 2)//['toLocaleString']("fullwide", {	'useGrouping': !![] });
					state.advance.lpARP = self.round(_0x2bd793 / parseInt(_0x5be814) * 100 * 12 * 365, 0)//.toLocaleString("fullwide", {	'useGrouping': !![]	});
					state.advance.daoARP = self.round(_0x24a228 / (parseInt(dsdsContractTotalBonded) / 10 ** 18) * 100 * 12 * 365, 0)//.toLocaleString("fullwide", {	'useGrouping': !![]	});
					
				});
			});
		},
  }
}
</script>

<style scoped>
	
	td:first-child {
		width: 150px;		
	}
	td:nth-child(2n) {
		width: 150px;
		font-family: monospace;
		font-size: 1.5rem;
	}
	.message {
		padding-left: .2rem;
    font-size: 1.5rem;
	}
</style>

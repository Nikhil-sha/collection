tailwind.config = {
	theme: {
		extend: {
			animation: {
				'fade-in': 'fadeIn 0.5s cubic-bezier(0.39, 0.575, 0.565, 1)',
				'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955)',
				'blur-out': 'blurDisappear 1s ease forwards',
				'expand-height': 'expand 0.28s cubic-bezier(0.895, 0.03, 0.685, 0.22)',
				'shrink-height': 'shrink 0.28s cubic-bezier(0.895, 0.03, 0.685, 0.22)',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(80px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				expand: {
					'0%': { height: '56px' },
					'100%': { height: '100%' }
				},
				shrink: {
					'0%': { height: '100%' },
					'100%': { height: '56px' }
				},
				blurDisappear: {
					'0%': { opacity: '1', filter: 'blur(0px)', transform: 'scale(1)', },
					'100%': { opacity: '0', filter: 'blur(10px)', transform: 'scale(0.95)', },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
		},
	},
}
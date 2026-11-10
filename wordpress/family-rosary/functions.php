<?php
/**
 * Family Rosary theme setup. Activation does not create or change site content.
 *
 * @package Family_Rosary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function family_rosary_setup() {
	load_theme_textdomain( 'family-rosary', get_template_directory() . '/languages' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo' );
	add_editor_style( 'assets/site.css' );
}
add_action( 'after_setup_theme', 'family_rosary_setup' );

function family_rosary_enqueue_assets() {
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'family-rosary-site', get_theme_file_uri( 'assets/site.css' ), array(), $version );
	wp_enqueue_script(
		'family-rosary-site',
		get_theme_file_uri( 'assets/site.js' ),
		array(),
		$version,
		array( 'strategy' => 'defer', 'in_footer' => true )
	);
}
add_action( 'wp_enqueue_scripts', 'family_rosary_enqueue_assets' );

function family_rosary_register_pattern_category() {
	register_block_pattern_category(
		'family-rosary',
		array( 'label' => __( 'Family Rosary', 'family-rosary' ) )
	);
}
add_action( 'init', 'family_rosary_register_pattern_category' );

/**
 * Show the bundled logo until an editor chooses a Site Logo.
 * The URL helper also supports WordPress installed in a subdirectory.
 */
function family_rosary_default_logo( $block_content, $block ) {
	if ( has_custom_logo() ) {
		return $block_content;
	}
	$width = ! empty( $block['attrs']['width'] ) ? absint( $block['attrs']['width'] ) : 176;
	return sprintf(
		'<div class="wp-block-site-logo"><a href="%1$s" class="custom-logo-link" rel="home"><img class="custom-logo" src="%2$s" width="%3$d" alt="%4$s" /></a></div>',
		esc_url( home_url( '/' ) ),
		esc_url( get_theme_file_uri( is_front_page() ? 'assets/logo-white.svg' : 'assets/logo.svg' ) ),
		$width,
		esc_attr__( 'Family Rosary — home', 'family-rosary' )
	);
}
add_filter( 'render_block_core/site-logo', 'family_rosary_default_logo', 10, 2 );

/** Resolve the theme's starter navigation relative to the WordPress site URL. */
function family_rosary_navigation_urls( $parsed_block ) {
	$routes = array( '/', '/#pray-today', '/#daily-prayer', '/how-to-pray-the-rosary/', '/prayerresources/', '/our-story/', '/watch-and-listen/' );
	if (
		'core/navigation-link' === $parsed_block['blockName'] &&
		isset( $parsed_block['attrs']['url'] ) &&
		in_array( $parsed_block['attrs']['url'], $routes, true )
	) {
		$parsed_block['attrs']['url'] = home_url( $parsed_block['attrs']['url'] );
	}
	return $parsed_block;
}
add_filter( 'render_block_data', 'family_rosary_navigation_urls' );

/** Additional media discovery is isolated from the other prayer pages. */
function family_rosary_cinema_assets() {
 wp_enqueue_script( 'family-rosary-cinema', get_theme_file_uri( 'assets/cinema.js' ), array( 'family-rosary-site' ), wp_get_theme()->get( 'Version' ), array( 'strategy' => 'defer', 'in_footer' => true ) );
}
add_action( 'wp_enqueue_scripts', 'family_rosary_cinema_assets' );

function family_rosary_prayer_experience_assets() {
 wp_enqueue_script( 'family-rosary-prayer-experience', get_theme_file_uri( 'assets/prayer-experience.js' ), array( 'family-rosary-site' ), wp_get_theme()->get( 'Version' ), array( 'strategy' => 'defer', 'in_footer' => true ) );
}
add_action( 'wp_enqueue_scripts', 'family_rosary_prayer_experience_assets' );

/** Shared resource and full Rosary experiences. */
function family_rosary_complete_experience_assets() {
 $version = wp_get_theme()->get( 'Version' );
 foreach ( array( 'cinema-v3', 'resource-discovery', 'rosary-world', 'home-family', 'companion', 'prayer-by-age', 'print-guide-v3' ) as $name ) {
  wp_enqueue_style( 'family-rosary-' . $name, get_theme_file_uri( 'assets/' . $name . '.css' ), array( 'family-rosary-site' ), $version );
 }
 foreach ( array( 'resource-discovery', 'rosary-journey', 'home-family', 'prayer-by-age' ) as $name ) {
  wp_enqueue_script( 'family-rosary-' . $name, get_theme_file_uri( 'assets/' . $name . '.js' ), array( 'family-rosary-site' ), $version, array( 'strategy' => 'defer', 'in_footer' => true ) );
 }
}
add_action( 'wp_enqueue_scripts', 'family_rosary_complete_experience_assets' );

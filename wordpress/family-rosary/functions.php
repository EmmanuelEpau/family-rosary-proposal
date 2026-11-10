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

/** Load the same route-specific bundles used by the review exporter. */
function family_rosary_complete_experience_assets() {
 $manifest = json_decode( file_get_contents( get_theme_file_path( 'assets/route-assets.json' ) ), true );
 $route = 'story';
 if ( is_page() && wp_get_post_parent_id( get_queried_object_id() ) && get_post_field( 'post_name', wp_get_post_parent_id( get_queried_object_id() ) ) === 'programs' ) { $route = 'program'; }
 $pages = array( 'watch-and-listen' => 'media', 'prayerresources' => 'resources', 'how-to-pray-the-rosary' => 'rosary-guide', 'rosary-prayer-guide' => 'print-guide', 'family-rosary-companion' => 'companion', 'praying-with-children' => 'prayer-by-age' );
 if ( is_front_page() ) { $route = 'home'; }
 foreach ( $pages as $slug => $name ) { if ( is_page( $slug ) ) { $route = $name; } }
 $version = wp_get_theme()->get( 'Version' );
 foreach ( array_unique( array_merge( $manifest['routes'][$route]['styles'], array( 'family-refinement' ) ) ) as $name ) {
  wp_enqueue_style( 'family-rosary-' . $name, get_theme_file_uri( 'assets/' . $name . '.css' ), array( 'family-rosary-site' ), $version );
 }
 foreach ( $manifest['routes'][$route]['scripts'] as $name ) {
  wp_enqueue_script( 'family-rosary-' . $name, get_theme_file_uri( 'assets/' . $name . '.js' ), array( 'family-rosary-site' ), $version, array( 'strategy' => 'defer', 'in_footer' => true ) );
 }
}
add_action( 'wp_enqueue_scripts', 'family_rosary_complete_experience_assets' );

/** Responsive derivatives preserve original photography and its editorial crop. */
function family_rosary_responsive_photos( $content ) {
 static $layouts;
 if ( ! isset( $layouts ) ) { $layouts = json_decode( file_get_contents( get_theme_file_path( 'assets/photo-layouts.json' ) ), true ); }
 $role_size = function( $markup, $roles, $fallback ) {
  if ( preg_match( '~\bclass="([^"]*)"~i', $markup, $classes ) ) {
   foreach ( preg_split( '~\s+~', $classes[1] ) as $class ) { if ( isset( $roles[$class] ) ) { return $roles[$class]; } }
  }
  return $fallback;
 };
 $photos = function( $html, $figure_size ) use ( $layouts, $role_size ) {
  return preg_replace_callback( '~<img\b[^>]*\bsrc="([^" ]*/assets/photos/([^/" ]+)\.jpg)"[^>]*>~i', function( $match ) use ( $layouts, $role_size, $figure_size ) {
   if ( strpos( $match[0], 'srcset=' ) !== false || ! file_exists( get_theme_file_path( 'assets/photos/' . $match[2] . '-640.webp' ) ) ) { return $match[0]; }
   $base = preg_replace( '~\.jpg$~', '', $match[1] );
   $size = preg_match( '~\bsizes="[^"]*"~i', $match[0] ) ? '' : ' sizes="' . esc_attr( $role_size( $match[0], $layouts['images'], $figure_size ) ) . '"';
   return str_replace( 'src="' . $match[1] . '"', 'src="' . esc_url( $base . '-1280.webp' ) . '" srcset="' . esc_url( $base . '-640.webp' ) . ' 640w, ' . esc_url( $base . '-1280.webp' ) . ' 1280w"' . $size, $match[0] );
  }, $html );
 };
 // Core image blocks keep their saved serialization; sizes are added at render time.
 $content = preg_replace_callback( '~<figure\b[^>]*>.*?</figure>~is', function( $match ) use ( $layouts, $role_size, $photos ) {
  return $photos( $match[0], $role_size( substr( $match[0], 0, strpos( $match[0], '>' ) + 1 ), $layouts['figures'], $layouts['default'] ) );
 }, $content );
 return $photos( $content, $layouts['default'] );
}
add_filter( 'render_block', 'family_rosary_responsive_photos' );

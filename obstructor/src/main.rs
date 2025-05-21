use image::{DynamicImage, Rgba};
use image::{GenericImage, GenericImageView};
use rand::Rng;

const BLOCK_SIZE: u32 = 200;
const OUTPUTPATH: &'static str = "../sample_images/output.png";
fn main() {
    let path = "../sample_images/image.png";

    let img = image::open(path).unwrap();
    let (x, y) = img.dimensions();
    let pixel = img.get_pixel(x - 1, y - 1);
    
    // to copy pixels from the image
    let pixel2 = Rgba::<u8>([0, 0, 0, 0]);
    // just a normal Black pixel

    println!("{:?}", (x, y));
    let coordinates = shadowgen(img, random_coordinates(&x, &y), pixel2);
    // This coordinates tag can now be used to generate proofs etc . 
}
fn random_coordinates(x: &u32, y: &u32) -> (u32, u32) {
    let mut rng = rand::rng();
    let x_coordinate = rng.random_range(0..x - &BLOCK_SIZE - 1);
    let y_coordinate = rng.random_range(0..y - &BLOCK_SIZE - 1);
    println!("{}  {}", x_coordinate, y_coordinate);
    (x_coordinate, y_coordinate)
}

fn shadowgen(mut img: DynamicImage, (block_x, block_y): (u32, u32), pixel: Rgba<u8>) -> (u32, u32) {
    for i in block_x..block_x + BLOCK_SIZE {
        for j in block_y..BLOCK_SIZE + block_y {
            img.put_pixel(i, j, pixel);
            
        }
    }
    img.save(OUTPUTPATH).unwrap();
    (block_x, block_y)
}
